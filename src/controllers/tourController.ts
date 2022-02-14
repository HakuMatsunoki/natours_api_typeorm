import type { RequestHandler } from "express";

import * as factory from "./handlerFactory";
import { Tour } from "../models";

export const getAllTours: RequestHandler = factory.getAll(Tour);
export const getTour: RequestHandler = factory.getOne(Tour);
export const createTour: RequestHandler = factory.createOne(Tour);
export const updateTour: RequestHandler = factory.updateOne(Tour);
export const deleteTour: RequestHandler = factory.deleteOne(Tour);
