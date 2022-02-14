import Joi from "joi";

import type { JoiValidatorsObj } from "../common";
import { appConfig, regexp } from "../configs";
import { LocationFields, TourDifficulties, TourFields } from "../constants";

export const tourRegularValidators: JoiValidatorsObj = {
  [TourFields.NAME]: Joi.string()
    .regex(regexp.NAME)
    .trim()
    .min(appConfig.TOUR_NAME_MIN_LENGTH)
    .max(appConfig.TOUR_NAME_MAX_LENGTH)
    .default(appConfig.TOUR_DEFAULT_NAME),
  [TourFields.DURATION]: Joi.number()
    .min(1)
    .max(appConfig.TOUR_MAX_DURATION)
    .default(1),
  [TourFields.MAX_GROUP]: Joi.number()
    .min(1)
    .max(appConfig.TOUR_MAX_GROUP)
    .default(1),
  [TourFields.DIFFICULTY]: Joi.string().valid(
    ...Object.values(TourDifficulties)
  ),
  [TourFields.PRICE]: Joi.number().min(0).default(0),
  [TourFields.DISCOUNT]: Joi.number().min(0),
  [TourFields.SUMM]: Joi.string().max(appConfig.TOUR_SUMM_MAX_LEN).trim(),
  [TourFields.DESC]: Joi.string().max(appConfig.TOUR_DESC_MAX_LEN).trim(),
  [TourFields.START_DATES]: Joi.array().items(Joi.date().greater("now").iso()),
  [TourFields.START_LOCATION]: Joi.object({
    [LocationFields.COORDS]: Joi.array().items(Joi.number().min(-180).max(180)),
    [LocationFields.ADDR]: Joi.string().max(appConfig.LOCATION_ADDR_MAX_LEN),
    [LocationFields.DESC]: Joi.string().max(appConfig.LOCATION_DESC_MAX_LEN)
  }),
  [TourFields.LOCATIONS]: Joi.array().items(
    Joi.object({
      [LocationFields.COORDS]: Joi.array().items(
        Joi.number().min(-180).max(180)
      ),
      [LocationFields.DESC]: Joi.string().max(appConfig.LOCATION_DESC_MAX_LEN),
      [LocationFields.DAY]: Joi.number().min(1).max(appConfig.LOCATION_DAY_MAX)
    })
  ),
  [TourFields.GUIDES]: Joi.array().items(Joi.string().regex(regexp.HEX)),
  [TourFields.SECRET]: Joi.boolean()
};
