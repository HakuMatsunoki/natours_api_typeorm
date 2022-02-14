import type { RequestHandler } from "express";
import { getManager } from "typeorm";
// import crypto from "crypto";

// import { RequestExt } from "../common";
import { Messages, StatusCodes } from "../constants";

import { User, UserObject } from "../models";

import { generateJWTPair, JWTPair, Email } from "../services";
import { AppError, catchAsync } from "../utils";

export const signup: RequestHandler = catchAsync(async (req, res, next) => {
  const manager = getManager();
  const newUser: UserObject = manager.create(User, req.body);

  const { id } = await manager.save(newUser);

  newUser.passwd = undefined;

  if (!id) return next(new AppError(Messages.INTERNAL, StatusCodes.INTERNAL));

  const tokenPair: JWTPair = generateJWTPair(id);
  const email: Email = new Email(newUser);

  // await Auth.create({ ...tokenPair, user: newUser.id });
  await email.sendWelcome();

  res.status(StatusCodes.OK).json({
    status: Messages.SUCCESS,
    user: newUser,
    tokenPair
  });
});

// testing
export const signget: RequestHandler = catchAsync(async (_req, res, _next) => {
  const manager = getManager();
  const user = await manager.find(User);
  console.log(user);

  res.status(200).json({
    result: "ok"
  });
});

// export const login: RequestHandler = catchAsync(
//   async (req: RequestExt, res, _next) => {
//     const user = req.user as UserDoc;
//     const tokenPair: JWTPair = generateJWTPair(user.id);

//     await Auth.create({ ...tokenPair, user: user.id });

//     res.status(StatusCodes.OK).json({
//       status: Messages.SUCCESS,
//       user,
//       tokenPair
//     });
//   }
// );

// export const logout: RequestHandler = catchAsync(async (req, res, _next) => {
//   const accessToken: string | undefined = req.get(TokenNames.AUTH);

//   await Auth.deleteOne({ accessToken });

//   res.status(StatusCodes.OK).json({
//     status: Messages.SUCCESS
//   });
// });

// export const logoutAll: RequestHandler = catchAsync(
//   async (req: RequestExt, res, _next) => {
//     const user = req.user as UserDoc;

//     await Auth.deleteMany({ user: user.id });

//     res.status(StatusCodes.OK).json({
//       status: Messages.SUCCESS
//     });
//   }
// );

// export const refresh: RequestHandler = catchAsync(
//   async (req: RequestExt, res, _next) => {
//     const refreshToken: string | undefined = req.get(TokenNames.AUTH);
//     const user = req.user as UserDoc;
//     const tokenPair: JWTPair = generateJWTPair(user.id);

//     await Auth.updateOne({ refreshToken }, { ...tokenPair, user });

//     res.status(StatusCodes.OK).json({
//       status: Messages.SUCCESS,
//       user,
//       tokenPair
//     });
//   }
// );

// export const forgotPasswd: RequestHandler = catchAsync(
//   async (req: RequestExt, res, _next) => {
//     const user = req.user as UserDoc;
//     const resetToken: string = user.createPasswdResetToken();
//     const email: Email = new Email(user);

//     await user.save({ validateBeforeSave: false });
//     await email.sendPasswdReset(resetToken);

//     res.status(StatusCodes.OK).json({
//       status: Messages.SUCCESS
//     });
//   }
// );

// export const resetPasswd: RequestHandler = catchAsync(
//   async (req, res, next) => {
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(req.params.token)
//       .digest("hex");

//     const user: UserDoc | null = await User.findOne({
//       passwdResetToken: hashedToken,
//       passwdResetExpires: { $gt: Date.now() }
//     });

//     if (!user)
//       return next(
//         new AppError(Messages.EXPIRED_TOKEN, StatusCodes.BAD_REQUEST)
//       );

//     user.passwd = req.body.passwd;
//     user.passwdResetToken = undefined;
//     user.passwdResetExpires = undefined;

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
//       user,
//       tokenPair
//     });
//   }
// );

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
