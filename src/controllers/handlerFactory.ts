import type { RequestHandler } from "express";
import { EntityManager, getManager, BaseEntity, UpdateResult, DeleteResult } from "typeorm";

import { RequestExt } from "../common";
import { Messages, StatusCodes } from "../constants";
import { User } from "../models";
import { AppError, catchAsync } from "../utils";

export const createOne = (Model: any): RequestHandler =>
  catchAsync(async (req, res, _next) => {
    const manager: EntityManager = getManager();
    const data: BaseEntity = getManager().create(Model, req.body);

    await manager.save(data);

    res.status(StatusCodes.CREATED).json({
      status: Messages.SUCCESS,
      data
    });
  });

export const updateOne = (Model: any): RequestHandler =>
  catchAsync(async (req: RequestExt, res, next) => {
    const id = req.params.id || (req.user as User).id;

    const data: UpdateResult = await getManager().update(Model, id, req.body);

    if (!data) {
      return next(new AppError(Messages.NO_DOCUMENT, StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: Messages.SUCCESS,
      data
    });
  });

export const getAll = (Model: any): RequestHandler =>
  catchAsync(async (_req, res, _next) => {
    const data: Array<BaseEntity> = await getManager().find(Model);

    res.status(StatusCodes.OK).json({
      status: Messages.SUCCESS,
      data
    });
  });

export const getOne = (Model: any): RequestHandler =>
  catchAsync(async (req, res, next) => {
    const data: BaseEntity | undefined = await getManager().findOne(Model, req.params.id);

    if (!data) {
      return next(new AppError(Messages.NO_DOCUMENT, StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      status: Messages.SUCCESS,
      data
    });
  });

export const deleteOne = (Model: any): RequestHandler =>
  catchAsync(async (req, res, next) => {
    const data: DeleteResult = await getManager().delete(Model, req.params.id);

    if (!data) {
      return next(new AppError(Messages.NO_DOCUMENT, StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.NO_CONTENT).json({
      status: Messages.SUCCESS,
      data: null
    });
  });
