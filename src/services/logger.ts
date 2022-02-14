import type { RequestHandler } from "express";

import { RequestExt } from "../common";

export const logger: RequestHandler = (req: RequestExt, _res, next) => {
  req.requestTime = new Date().toISOString();
  console.log('Request: ', req.requestTime, req.originalUrl);
  
  next();
}