import { model, Schema } from "mongoose";

import { ModelTableNames } from "../constants";
import { UserObject } from "./userModel";

export interface AuthObject {
  accessToken: string;
  refreshToken: string;
  user: Schema.Types.ObjectId | UserObject;
}

const authSchema: Schema = new Schema<AuthObject>(
  {
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: ModelTableNames.USER
    }
  },
  { timestamps: true }
);

export const Auth = model<AuthObject>(ModelTableNames.AUTH, authSchema);
