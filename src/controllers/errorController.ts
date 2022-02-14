import type { ErrorRequestHandler } from "express";

import { serverConfigs } from "../configs";
import { DevStatus } from "../constants";
// import { AppError } from "../utils";

const sendErrorDev: ErrorRequestHandler = (err, _req, res) => {
  // A) API
  // if (req.originalUrl.startsWith("/api")) {

  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
  // }
};

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (serverConfigs.NODE_ENV === DevStatus.DEV) {
    sendErrorDev(err, req, res, next);
  }
  // else if (process.env.NODE_ENV === "production") {
  //   /*If you are making a copy of the object by Destructuring it like this:
  //   let error = {...err};
  //   this won't Include the name property.
  //   Do:
  //   let error = {...err, name: err.name};
  //   or:
  //   if(err.stack.startsWith('CastError')
  //   */
  //   // let error = { ...err }; // it doesn't add name and message for some reason...
  //   let error = { ...err, name: err.name, message: err.message };
  //   console.log("Error: ", error);

  //   if (error.name === "CastError") error = handleCastErrorDB(error);

  //   if (error.code === 11000) error = handleDuplicatedFieldsDB(error);

  //   if (error.name === "ValidationError")
  //     error = handleValidationErrorDB(error);
  //   if (error.name === "JsonWebTokenError") error = handleJWTError(error);
  //   if (error.name === "TokenExpiredError")
  //     error = handleJWTExpiredError(error);
  //   sendErrorProd(error, req, res);
  // }
};
