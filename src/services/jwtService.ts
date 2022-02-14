import * as jwt from "jsonwebtoken";

import { appConfig } from "../configs";
import { Messages, StatusCodes } from "../constants";
import { AppError } from "../utils";

export interface JWTPair {
  accessToken: string;
  refreshToken: string;
}

export const generateJWTPair = (id: string): JWTPair => {
  const accessToken = jwt.sign({ id }, appConfig.ACCESS_TOKEN_SECRET, {
    expiresIn: appConfig.ACCESS_TOKEN_EXPIRES_IN
  });

  const refreshToken = jwt.sign({ id }, appConfig.REFRESH_TOKEN_SECRET, {
    expiresIn: appConfig.REFRESH_TOKEN_EXPIRES_IN
  });

  return {
    accessToken,
    refreshToken
  };
};

export const verifyToken = (
  token: string,
  access: boolean = true
): string | jwt.JwtPayload => {
  try {
    const secret = access
      ? appConfig.ACCESS_TOKEN_SECRET
      : appConfig.REFRESH_TOKEN_SECRET;

    return jwt.verify(token, secret);
  } catch (err) {
    throw new AppError(Messages.INVALID_TOKEN, StatusCodes.UNAUTH);
  }
};
