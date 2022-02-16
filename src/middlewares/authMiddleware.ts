import { RequestHandler } from "express";
import { getManager, getRepository } from "typeorm";
import { JwtPayload } from "jsonwebtoken";

import { RequestExt } from "../common";
import { UserRoles, Messages, StatusCodes, TokenNames, UserFields } from "../constants";
import { User, Auth } from "../models";
import { verifyToken } from "../services";
import { AppError, catchAsync, filterRequestObject, userNameHandler } from "../utils";
import { userStrictValidators, userLoginValidators } from "../validators";

/**
 * Check incoming user data middleware function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isUserDataValid: RequestHandler = (req, _res, next): void => {
  const allowedFields: string[] = [UserFields.NAME, UserFields.EMAIL, UserFields.PASSWD];

  req.body = filterRequestObject(req.body, allowedFields, userStrictValidators);
  req.body.role = UserRoles.USER;
  req.body.name = userNameHandler(req.body.name);

  next();
};

/**
 * Check duplicated account middleware function with catch-async-errors wrapper
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isNotEmailExist: RequestHandler = catchAsync(async (req, _res, next): Promise<void> => {
  const { email } = req.body;
  const userExist: boolean = !!(await getManager().findOne(User, { email }));

  if (userExist) return next(new AppError(Messages.DUPLICATED_ACCOUNT, StatusCodes.CONFLICT));

  next();
});

/**
 * Check incoming user password middleware function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isPasswdValid: RequestHandler = (req, _res, next): void => {
  const allowedFields: string[] = [UserFields.PASSWD];

  req.body = filterRequestObject(req.body, allowedFields, userStrictValidators);

  next();
};

/**
 * Check if user account exists middleware function with catch-async-errors wrapper
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isAccountExist: RequestHandler = catchAsync(async (req: RequestExt, _res, next): Promise<void> => {
  const allowedFields: string[] = [UserFields.EMAIL];
  const { email } = filterRequestObject(req.body, allowedFields, userStrictValidators);

  const user: User | undefined = await getManager().findOne(User, { email });

  if (!user) return next(new AppError(Messages.NO_USER, StatusCodes.NOT_FOUND));

  req.user = user;

  next();
});

/**
 * Check is user authenticated middleware function with catch-async-errors wrapper
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const isAuthenticated: RequestHandler = catchAsync(async (req: RequestExt, _res, next): Promise<void> => {
  const allowedFields: string[] = [UserFields.EMAIL, UserFields.PASSWD];
  const { email, passwd } = filterRequestObject(req.body, allowedFields, userLoginValidators, Messages.INVALID_AUTH);

  const user: User | undefined = await getRepository(User)
    .createQueryBuilder("user")
    .where({ email })
    .select(["user", "user.passwd"])
    .getOne();

  if (!user || !(await user.checkPasswd(passwd))) {
    return next(new AppError(Messages.INVALID_AUTH, StatusCodes.UNAUTH));
  }

  user.passwd = "";
  req.user = user;

  next();
});

/**
 * Get access to authenticated users only middleware function with catch-async-errors wrapper
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const protectRoute: RequestHandler = catchAsync(async (req: RequestExt, _res, next): Promise<void> => {
  const accessToken: string | undefined = req.get(TokenNames.AUTH);

  if (!accessToken) return next(new AppError(Messages.INVALID_TOKEN, StatusCodes.UNAUTH));

  const authObject: Auth | undefined = await getManager().findOne(Auth, {
    where: { accessToken },
    relations: ["user"]
  });

  const user = authObject?.user as User | undefined;
  const decoded = verifyToken(accessToken) as JwtPayload;

  if (!decoded.id || !decoded.iat || !user || user.id !== decoded.id)
    return next(new AppError(Messages.INVALID_TOKEN, StatusCodes.UNAUTH));

  req.user = user;

  next();
});

/**
 * Check user refresh token middleware function with catch-async-errors wrapper
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const checkRefresh: RequestHandler = catchAsync(async (req: RequestExt, _res, next): Promise<void> => {
  const refreshToken: string | undefined = req.get(TokenNames.AUTH);

  if (!refreshToken) return next(new AppError(Messages.INVALID_TOKEN, StatusCodes.UNAUTH));

  const authObject: Auth | undefined = await getManager().findOne(Auth, {
    where: { refreshToken },
    relations: ["user"]
  });

  const user = authObject?.user as User | undefined;
  const { id } = verifyToken(refreshToken, false) as JwtPayload;

  if (!id || !user || user.id !== id) return next(new AppError(Messages.INVALID_TOKEN, StatusCodes.UNAUTH));

  req.user = user;

  next();
});

/**
 * Get access to some user roles only middleware function with wrapper
 * @param {Array<string>} userRoles - list of the user roles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const restrictTo =
  (...userRoles: Array<string>): RequestHandler =>
  (req: RequestExt, _res, next) => {
    const user = req.user as User;

    if (!userRoles.includes(user.role)) return next(new AppError(Messages.NOT_ALLOWED, StatusCodes.NOT_ALLOWED));

    next();
  };
