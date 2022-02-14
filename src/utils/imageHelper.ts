import { UploadedFile } from "express-fileupload";

import { AppError } from "./";
import { appConfig } from "../configs";
import { Messages, StatusCodes } from "../constants";

export const imageCheckHelper = (
  img: UploadedFile,
  maxSize: number = appConfig.IMG_MAX_SIZE
): AppError | undefined => {
  if (img.size > maxSize)
    return new AppError(Messages.FILE_LARGE, StatusCodes.BAD_REQUEST);

  const fileType: string = img.mimetype;

  if (!fileType.includes("image"))
    return new AppError(Messages.FILE_INVALID, StatusCodes.BAD_REQUEST);

  return undefined;
};
