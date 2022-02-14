import type { Request } from "express";
import type { UploadedFile } from "express-fileupload";
import type { AnySchema } from "joi";

import { UserObject } from "../models";

export interface RequestExt extends Request {
  user?: UserObject;
  photo?: UploadedFile | UploadedFile[];
  requestTime?: string;
}

export interface JoiValidatorsObj {
  [prop: string]: AnySchema;
}

export interface UnknownObj {
  [prop: string]: any;
}
