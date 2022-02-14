import sharp from "sharp";
import { UploadedFile } from "express-fileupload";

import { appConfig } from "../configs";

interface Resolution {
  height: number;
  width: number;
}

export const imageSharper = async (
  photo: UploadedFile,
  { height, width }: Resolution = {
    height: appConfig.USER_AVATAR_RESOLUTION,
    width: appConfig.USER_AVATAR_RESOLUTION
  }
) =>
  await sharp(photo.data)
    .resize(height, width)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();
