import Joi from "joi";

import type { JoiValidatorsObj } from "../common";
import { regexp } from "../configs";
import { Params } from "../constants";

export const paramsValidators: JoiValidatorsObj = {
  [Params.ID]: Joi.string().regex(regexp.HEX),
};
