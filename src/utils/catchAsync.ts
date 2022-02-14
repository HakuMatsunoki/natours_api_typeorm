import type { RequestHandler } from "express";

export function catchAsync(fn: RequestHandler): RequestHandler {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      return next(err);
    }
  };
}
