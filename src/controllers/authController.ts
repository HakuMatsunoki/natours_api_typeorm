import type { RequestHandler } from "express";
import { EntityManager, getManager, getRepository, MoreThan } from "typeorm";
import crypto from "crypto";

import { RequestExt } from "../common";
import { Messages, StatusCodes, TokenNames } from "../constants";
import { User, Auth } from "../models";
import { generateJWTPair, JWTPair, Email } from "../services";
import { AppError, catchAsync } from "../utils";

/**
 * Signup controller function with catch-async-errors wrapper
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const signup: RequestHandler = catchAsync(async (req, res, next): Promise<void> => {
  const manager: EntityManager = getManager();
  const newUser: User = manager.create(User, req.body);

  const { id } = await manager.save(newUser);

  newUser.passwd = "";

  if (!id) return next(new AppError(Messages.INTERNAL, StatusCodes.INTERNAL));

  const tokenPair: JWTPair = generateJWTPair(id);
  const email: Email = new Email(newUser);
  const newAuth: Auth = manager.create(Auth, { ...tokenPair, user: newUser });

  await manager.save(newAuth);
  await email.sendWelcome();

  res.status(StatusCodes.OK).json({
    status: Messages.SUCCESS,
    user: newUser,
    tokenPair
  });
});

/**
 * Login controller function with catch-async-errors wrapper
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const login: RequestHandler = catchAsync(async (req: RequestExt, res, _next): Promise<void> => {
  const manager: EntityManager = getManager();
  const user = req.user as User;
  const tokenPair: JWTPair = generateJWTPair(user.id);
  const newAuth: Auth = manager.create(Auth, { ...tokenPair, user });

  await manager.save(newAuth);

  res.status(StatusCodes.OK).json({
    status: Messages.SUCCESS,
    user,
    tokenPair
  });
});

/**
 * Logout controller function with catch-async-errors wrapper
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const logout: RequestHandler = catchAsync(async (req, res, _next): Promise<void> => {
  const accessToken: string | undefined = req.get(TokenNames.AUTH);

  await getManager().delete(Auth, { accessToken });

  res.status(StatusCodes.OK).json({
    status: Messages.SUCCESS
  });
});

/**
 * Logout all devices controller function with catch-async-errors wrapper
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const logoutAll: RequestHandler = catchAsync(async (req: RequestExt, res, _next): Promise<void> => {
  const user = req.user as User;

  await getManager().delete(Auth, { user });

  res.status(StatusCodes.OK).json({
    status: Messages.SUCCESS
  });
});

/**
 * Refresh jwt-pair controller function with catch-async-errors wrapper
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const refresh: RequestHandler = catchAsync(async (req: RequestExt, res, _next): Promise<void> => {
  const refreshToken: string | undefined = req.get(TokenNames.AUTH);
  const user = req.user as User;
  const tokenPair: JWTPair = generateJWTPair(user.id);

  await getManager().update(Auth, { refreshToken }, { ...tokenPair, user });

  res.status(StatusCodes.OK).json({
    status: Messages.SUCCESS,
    user,
    tokenPair
  });
});

/**
 * Create password reset token controller function with catch-async-errors wrapper
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const forgotPasswd: RequestHandler = catchAsync(async (req: RequestExt, res, _next): Promise<void> => {
  const manager: EntityManager = getManager();
  const user = req.user as User;
  const resetToken: string = user.createPasswdResetToken();
  const email: Email = new Email(user);

  await manager.save(user);
  await email.sendPasswdReset(resetToken);

  res.status(StatusCodes.OK).json({
    status: Messages.SUCCESS,
    resetToken
  });
});

/**
 * Reset password controller function with catch-async-errors wrapper
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const resetPasswd: RequestHandler = catchAsync(async (req, res, next): Promise<void> => {
  const manager: EntityManager = getManager();
  const hashedToken: string = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user: User | undefined = await manager.findOne(User, {
    passwdResetToken: hashedToken,
    passwdResetExpires: MoreThan(Date.now())
  });

  if (!user) return next(new AppError(Messages.EXPIRED_TOKEN, StatusCodes.BAD_REQUEST));

  user.passwd = req.body.passwd;
  user.passwdResetToken = null;
  user.passwdResetExpires = null;

  await user.save();

  user.passwd = "";

  const tokenPair: JWTPair = generateJWTPair(user.id);
  const newAuth: Auth = manager.create(Auth, { ...tokenPair, user });

  await manager.delete(Auth, { user });
  await manager.save(newAuth);

  const email: Email = new Email(user);
  const msg: string = Messages.PASS_UPDATED;

  await email.sendCustomMsg(msg);

  res.status(StatusCodes.OK).json({
    status: Messages.SUCCESS,
    user,
    tokenPair
  });
});

/**
 * Controller function to update current user password with catch-async-errors wrapper
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateMyPasswd: RequestHandler = catchAsync(async (req: RequestExt, res, next): Promise<void> => {
  const manager: EntityManager = getManager();
  const { id } = req.user as User;

  const user: User | undefined = await getRepository(User)
    .createQueryBuilder("user")
    .where({ id })
    .select(["user", "user.passwd"])
    .getOne();

  if (!user || !(await user.checkPasswd(req.body.passwdCurrent))) {
    return next(new AppError(Messages.INVALID_PASSWD_CURRENT, StatusCodes.UNAUTH));
  }

  user.passwd = req.body.passwd;

  await user.save();

  user.passwd = "";
  const tokenPair: JWTPair = generateJWTPair(user.id);
  const newAuth: Auth = manager.create(Auth, { ...tokenPair, user });

  await manager.delete(Auth, { user });
  await manager.save(newAuth);

  const email: Email = new Email(user);
  const msg: string = Messages.PASS_UPDATED;

  await email.sendCustomMsg(msg);

  res.status(StatusCodes.OK).json({
    status: Messages.SUCCESS,
    tokenPair
  });
});
