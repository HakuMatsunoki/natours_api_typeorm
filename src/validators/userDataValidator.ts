import Joi from "joi";

import type { JoiValidatorsObj } from "../common";
import { regexp } from "../configs";
import { UserFields, UserRoles } from "../constants";

export const userRegularValidators: JoiValidatorsObj = {
  [UserFields.NAME]: Joi.string().regex(regexp.NAME).trim(),
  [UserFields.EMAIL]: Joi.string().regex(regexp.EMAIL).trim()
};

export const userStrictValidators: JoiValidatorsObj = {
  [UserFields.NAME]: Joi.string().regex(regexp.NAME).trim().required(),
  [UserFields.EMAIL]: Joi.string().regex(regexp.EMAIL).trim().required(),
  [UserFields.PASSWD]: Joi.string().regex(regexp.PASSWD).trim().required(),
  [UserFields.ROLE]: Joi.string().valid(...Object.values(UserRoles))
};

export const userLoginValidators: JoiValidatorsObj = {
  [UserFields.EMAIL]: Joi.string().regex(regexp.EMAIL).trim().required(),
  [UserFields.PASSWD]: Joi.string().trim().required()
};
