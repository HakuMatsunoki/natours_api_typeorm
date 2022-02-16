import type { ErrorRequestHandler } from "express";

import { serverConfigs } from "../configs";
import { DevStatus } from "../constants";

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (serverConfigs.NODE_ENV !== DevStatus.DEV) return;

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};
