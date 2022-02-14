import type { RequestHandler } from "express";
import { Model, Document } from "mongoose";

import { Messages, StatusCodes } from "../constants";
import { AppError, catchAsync, filterRequestObject } from "../utils";
import { paramsValidators } from "../validators";

export const checkModelById = (Model: Model<any>): RequestHandler =>
  catchAsync(async (req, _res, next) => {
    const allowedFields: string[] = ["id"];
    req.params = filterRequestObject(
      req.params,
      allowedFields,
      paramsValidators
    );
    const data: Document = await Model.findById(req.params.id);

    if (!data) {
      return next(new AppError(Messages.NO_DOCUMENT, StatusCodes.NOT_FOUND));
    }

    next();
  });
