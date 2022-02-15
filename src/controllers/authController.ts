import type { RequestHandler } from "express";
import { EntityManager, getManager, MoreThan } from "typeorm";
import crypto from "crypto";

import { RequestExt } from "../common";
import { Messages, StatusCodes, TokenNames } from "../constants";
import { User, Auth } from "../models";
import { generateJWTPair, JWTPair, Email } from "../services";
import { AppError, catchAsync } from "../utils";

export const signup: RequestHandler = catchAsync(async (req, res, next) => {
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

export const login: RequestHandler = catchAsync(async (req: RequestExt, res, _next) => {
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

export const logout: RequestHandler = catchAsync(async (req, res, _next) => {
  const accessToken: string | undefined = req.get(TokenNames.AUTH);

  await getManager().delete(Auth, { accessToken });

  res.status(StatusCodes.OK).json({
    status: Messages.SUCCESS
  });
});

export const logoutAll: RequestHandler = catchAsync(async (req: RequestExt, res, _next) => {
  const user = req.user as User;

  await getManager().delete(Auth, { user });

  res.status(StatusCodes.OK).json({
    status: Messages.SUCCESS
  });
});

export const refresh: RequestHandler = catchAsync(async (req: RequestExt, res, _next) => {
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

export const forgotPasswd: RequestHandler = catchAsync(async (req: RequestExt, res, _next) => {
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

export const resetPasswd: RequestHandler = catchAsync(async (req, res, next) => {
  const manager: EntityManager = getManager();
  const hashedToken: string = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user: User | undefined = await manager.findOne(User, {
    passwdResetToken: hashedToken,
    passwdResetExpires: MoreThan(Date.now())
  });

  if (!user) return next(new AppError(Messages.EXPIRED_TOKEN, StatusCodes.BAD_REQUEST));

  user.passwd = req.body.passwd;
  user.passwdResetToken = undefined;
  user.passwdResetExpires = undefined;

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

// export const updateMyPasswd: RequestHandler = catchAsync(
//   async (req: RequestExt, res, next) => {
//     const { id } = req.user as UserDoc;

//     const user: UserDoc | null = await User.findById(id).select("+passwd");

//     if (!user || !(await user.checkPasswd(req.body.passwdCurrent))) {
//       return next(
//         new AppError(Messages.INVALID_PASSWD_CURRENT, StatusCodes.UNAUTH)
//       );
//     }

//     user.passwd = req.body.passwd;

//     await user.save();

//     user.passwd = undefined;
//     const tokenPair: JWTPair = generateJWTPair(user.id);

//     await Auth.deleteMany({ user: user.id });
//     await Auth.create({ ...tokenPair, user: user.id });

//     const email: Email = new Email(user);
//     const msg: string = Messages.PASS_UPDATED;

//     await email.sendCustomMsg(msg);

//     res.status(StatusCodes.OK).json({
//       status: Messages.SUCCESS,
//       tokenPair
//     });
//   }
// );
