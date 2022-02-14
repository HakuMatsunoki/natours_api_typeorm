import type { RequestHandler } from "express";
import type { GetObjectCommandOutput } from "@aws-sdk/client-s3";
import type { Readable } from "stream";
import path from "path";

import { RequestExt } from "../common";
import { Messages, StatusCodes } from "../constants";
import * as factory from "./handlerFactory";
import { User, UserDoc } from "../models";
import { s3BucketDownload } from "../services";
import { catchAsync } from "../utils";

export const getAllUsers: RequestHandler = factory.getAll(User);
export const createUser: RequestHandler = factory.createOne(User);
export const getUser: RequestHandler = factory.getOne(User);
export const updateUser: RequestHandler = factory.updateOne(User);
export const deleteUser: RequestHandler = factory.deleteOne(User);

export const getMe: RequestHandler = (req: RequestExt, res, _next) => {
  const user = req.user as UserDoc;

  res.status(StatusCodes.OK).json({
    status: Messages.SUCCESS,
    user
  });
};

export const updateMe: RequestHandler = factory.updateOne(User);

export const deleteMe: RequestHandler = catchAsync(async (req: RequestExt, res, _next) => {
  const { id } = req.user as UserDoc;

  await User.findByIdAndUpdate(id, { active: false });

  res.status(StatusCodes.NO_CONTENT).json({
    status: Messages.SUCCESS,
    data: null
  });
});

export const getPhoto: RequestHandler = catchAsync(async (req, res) => {
  const { id, name } = req.params;
  const imagePath: string = path.join("users", id, name);

  const data: GetObjectCommandOutput = await s3BucketDownload(imagePath);

  const readable = data.Body as Readable;

  res.contentType("image/jpeg");
  readable.pipe(res);
});
