import type { RequestHandler } from "express";

import * as factory from "./handlerFactory";
import { Review } from "../models";

export const getAllTours: RequestHandler = factory.getAll(Review);
export const getTour: RequestHandler = factory.getOne(Review);
export const createTour: RequestHandler = factory.createOne(Review);
export const updateTour: RequestHandler = factory.updateOne(Review);
export const deleteTour: RequestHandler = factory.deleteOne(Review);
