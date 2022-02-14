import * as Joi from "joi";

import { JoiValidatorsObj, UnknownObj } from "../common";
import { Messages, StatusCodes } from "../constants";
import { AppError } from ".";

export const filterRequestObject = (
  obj: UnknownObj,
  allowedFields: string[],
  validators: JoiValidatorsObj,
  errorMsg?: string
): UnknownObj => {
  const options: JoiValidatorsObj = {};

  allowedFields.forEach((item) => {
    if (item in validators) options[item] = validators[item];
  });

  const validated = Joi.object(options).validate(obj);

  if (validated.error)
    throw new AppError(
      errorMsg || Messages.INVALID_CREDS + validated.error.details[0].message,
      StatusCodes.BAD_REQUEST
    );

  return { ...validated.value };
};
