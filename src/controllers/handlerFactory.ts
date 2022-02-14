import type { RequestHandler } from "express";
import { Model, Document } from "mongoose";

import { RequestExt } from "../common";
import { Messages, StatusCodes } from "../constants";
import { UserDoc } from "../models";
import { AppError, catchAsync } from "../utils";

export const createOne = (Model: Model<any>): RequestHandler =>
  catchAsync(async (req, res, _next) => {
    const data: Document = await Model.create(req.body);

    res.status(StatusCodes.CREATED).json({
      status: Messages.SUCCESS,
      data
    });
  });

export const updateOne = (Model: Model<any>): RequestHandler =>
  catchAsync(async (req: RequestExt, res, next) => {
    const id = req.params.id || (req.user as UserDoc).id;

    const data: Document = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!data) {
      return next(new AppError(Messages.NO_DOCUMENT, StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: Messages.SUCCESS,
      data
    });
  });

export const getAll = (Model: Model<any>): RequestHandler =>
  catchAsync(async (_req, res, _next) => {
    const data: Array<Document> = await Model.find();

    res.status(StatusCodes.OK).json({
      status: Messages.SUCCESS,
      data
    });
  });

export const getOne = (Model: Model<any>): RequestHandler =>
  catchAsync(async (req, res, next) => {
    const data: Document = await Model.findById(req.params.id);

    if (!data) {
      return next(new AppError(Messages.NO_DOCUMENT, StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: Messages.SUCCESS,
      data
    });
  });

export const deleteOne = (Model: Model<any>): RequestHandler =>
  catchAsync(async (req, res, next) => {
    const data: Document = await Model.findByIdAndDelete(req.params.id);

    if (!data) {
      return next(new AppError(Messages.NO_DOCUMENT, StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.NO_CONTENT).json({
      status: Messages.SUCCESS,
      data: null
    });
  });
