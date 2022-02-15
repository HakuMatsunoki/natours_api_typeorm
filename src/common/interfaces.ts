import type { Request } from "express";
// import type { UploadedFile } from "express-fileupload";
import type { AnySchema } from "joi";

import { User } from "../models";

export interface RequestExt extends Request {
  user?: User;
  // photo?: UploadedFile | UploadedFile[];
  requestTime?: string;
}

export interface JoiValidatorsObj {
  [prop: string]: AnySchema;
}

export interface UnknownObj {
  [prop: string]: any;
}
