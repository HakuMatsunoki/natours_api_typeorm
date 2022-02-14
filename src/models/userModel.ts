import bcrypt from "bcryptjs";
import crypto from "crypto";
import { model, Schema, Document } from "mongoose";

import { appConfig } from "../configs";
import { ModelTableNames, UserFields, UserRoles } from "../constants";

export interface UserObject {
  [UserFields.NAME]: string;
  [UserFields.EMAIL]: string;
  [UserFields.PHOTO]: string;
  [UserFields.ROLE]: string;
  [UserFields.PASSWD]?: string;
  [UserFields.PASSWD_CHANGED_AT]?: Date;
  [UserFields.PASSWD_RESET_TOKEN]?: string;
  [UserFields.PASSWD_RESET_EXPIRES]?: Date | object;
  [UserFields.ACTIVE]?: boolean;
  checkPasswd: (candidatePasswd: string) => Promise<boolean>;
  createPasswdResetToken: () => string;
  changedPasswdAfter: (JWTTimestamp: number) => boolean;
}

export interface UserDoc extends UserObject, Document {}

const userSchema = new Schema<UserObject>(
  {
    [UserFields.NAME]: {
      type: String,
      required: true,
      trim: true
    },
    [UserFields.EMAIL]: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    [UserFields.PHOTO]: {
      type: String,
      default: appConfig.DEFAULT_USER_AVATAR
    },
    [UserFields.ROLE]: {
      type: String,
      enum: UserRoles,
      default: UserRoles.USER
    },
    [UserFields.PASSWD]: {
      type: String,
      required: true,
      minlength: appConfig.USER_PASSWD_MIN_LENGTH,
      select: false
    },
    [UserFields.PASSWD_CHANGED_AT]: Date,
    [UserFields.PASSWD_RESET_TOKEN]: String,
    [UserFields.PASSWD_RESET_EXPIRES]: Date,
    [UserFields.ACTIVE]: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next): Promise<void> {
  if (!this.isModified("passwd")) return next();

  this.passwd = await bcrypt.hash(this.passwd, appConfig.BCRYPT_COST);

  next();
});

userSchema.pre("save", function (next): void {
  if (!this.isModified("passwd") || this.isNew) return next();

  this.passwdChangedAt = new Date(Date.now() - 1000);

  next();
});

userSchema.pre(/^find/, function (next): void {
  this.find({
    active: { $ne: false },
  }).select("-__v -passwdResetExpires -passwdResetToken");

  next();
});

userSchema.methods.checkPasswd = async function (
  candidatePasswd: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePasswd, this.passwd);
};

// maybe not necessary
userSchema.methods.changedPasswdAfter = function (
  JWTTimestamp: number
): boolean {
  if (this.passwdChangedAt)
    return JWTTimestamp < this.passwdChangedAt.getTime() / 1000;

  return false;
};

userSchema.methods.createPasswdResetToken = function (): string {
  const resetToken: string = crypto
    .randomBytes(appConfig.PASSWD_RESET_TOKEN_LENGTH)
    .toString("hex");
  this.passwdResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwdResetExpires =
    Date.now() + appConfig.PASSWD_RESET_TOKEN_EXPIRES_IN * 60 * 1000;

  return resetToken;
};

export const User = model<UserDoc>(ModelTableNames.USER, userSchema);
