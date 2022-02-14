import { RequestHandler } from "express";
import { UploadedFile } from "express-fileupload";
import crypto from "crypto";

import { RequestExt } from "../common";
import { appConfig } from "../configs";
import { Messages, Params, StatusCodes, UserFields } from "../constants";
import { UserDoc } from "../models";
import { Email, s3BucketUpload, imageSharper } from "../services";
import {
  AppError,
  catchAsync,
  fileNameBuilder,
  FileName,
  filterRequestObject,
  imageCheckHelper
} from "../utils";
import {
  paramsValidators,
  userRegularValidators,
  userStrictValidators
} from "../validators";

export const filterCreateUserObject: RequestHandler = (req, _res, next) => {
  const allowedFields: string[] = [
    UserFields.NAME,
    UserFields.EMAIL,
    UserFields.ROLE
  ];
  req.body = filterRequestObject(req.body, allowedFields, userStrictValidators);

  next();
};

export const filterUpdateUserObject: RequestHandler = (req, _res, next) => {
  const allowedFields: string[] = [UserFields.NAME, UserFields.EMAIL];
  req.body = filterRequestObject(
    req.body,
    allowedFields,
    userRegularValidators
  );

  next();
};

export const checkId: RequestHandler = (req, _res, next) => {
  const allowedFields: string[] = [Params.ID];
  req.params = filterRequestObject(req.params, allowedFields, paramsValidators);

  next();
};

export const sendTempUserCreds: RequestHandler = catchAsync(
  async (req, _res, next) => {
    req.body.passwd = crypto
      .randomBytes(appConfig.PASSWD_RESET_TOKEN_LENGTH)
      .toString("hex");

    const user = req.body as UserDoc;
    const email: Email = new Email(user);

    await email.sendWelcomeFromRoot(appConfig.CHANGE_PASSWD_URL);

    next();
  }
);

export const checkUserPhoto: RequestHandler = (req: RequestExt, _res, next) => {
  const photo: UploadedFile | UploadedFile[] | undefined = req.files?.photo;

  if (!photo) return next();

  if (Array.isArray(photo))
    return next(
      new AppError(Messages.FILE_NOT_SINGLE, StatusCodes.BAD_REQUEST)
    );

  const error: AppError | undefined = imageCheckHelper(photo);

  if (error) return next(error);

  req.photo = photo;

  next();
};

export const uploadPhoto: RequestHandler = catchAsync(
  async (req: RequestExt, _res, next) => {
    const photo = req.photo as UploadedFile;

    if (!photo) return next();

    const { id } = req.user as UserDoc;
    const fileNameObj: FileName = fileNameBuilder("jpg", "users", id);

    const sharpedPhoto: Buffer = await imageSharper(photo);
    await s3BucketUpload(fileNameObj.path, photo.mimetype, sharpedPhoto);

    req.body.photo = fileNameObj.path;

    next();
  }
);
