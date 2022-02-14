import bcrypt from "bcryptjs";
import crypto from "crypto";
// import { model, Schema, Document } from "mongoose";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, BeforeInsert } from "typeorm";

import { appConfig } from "../configs";
// import { ModelTableNames, UserFields, UserRoles } from "../constants";
import { UserFields } from "../constants";

export interface UserObject {
  id?: string;
  [UserFields.NAME]: string;
  [UserFields.EMAIL]: string;
  [UserFields.PHOTO]: string;
  [UserFields.ROLE]: string;
  [UserFields.PASSWD]?: string;
  [UserFields.PASSWD_CHANGED_AT]?: Date;
  [UserFields.PASSWD_RESET_TOKEN]?: string;
  [UserFields.PASSWD_RESET_EXPIRES]?: number;
  [UserFields.ACTIVE]?: boolean;
  checkPasswd: (candidatePasswd: string) => Promise<boolean>;
  createPasswdResetToken: () => string;
  // changedPasswdAfter: (JWTTimestamp: number) => boolean;
}

export interface UserDoc extends UserObject, Document {}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  [UserFields.NAME]: string;

  @Column()
  [UserFields.EMAIL]: string;

  @Column("varchar", { default: appConfig.DEFAULT_USER_AVATAR })
  [UserFields.PHOTO]: string;

  @Column()
  [UserFields.ROLE]: string;

  @Column()
  [UserFields.PASSWD]: string;

  @Column("bigint", { default: Date.now() })
  [UserFields.PASSWD_CHANGED_AT]: Date;

  @Column("varchar", { default: null })
  [UserFields.PASSWD_RESET_TOKEN]: string;

  @Column("bigint", { default: null })
  [UserFields.PASSWD_RESET_EXPIRES]: number;

  @Column("boolean", { default: true })
  [UserFields.ACTIVE]: boolean;

  @BeforeInsert()
  async updateDates(): Promise<void> {
    this[UserFields.PASSWD] = await bcrypt.hash(this.passwd, appConfig.BCRYPT_COST);
  }

  async checkPasswd(candidatePasswd: string): Promise<boolean> {
    return await bcrypt.compare(candidatePasswd, this.passwd);
  }

  createPasswdResetToken(): string {
    const resetToken: string = crypto.randomBytes(appConfig.PASSWD_RESET_TOKEN_LENGTH).toString("hex");

    this[UserFields.PASSWD_RESET_TOKEN] = crypto.createHash("sha256").update(resetToken).digest("hex");
    this[UserFields.PASSWD_RESET_EXPIRES] = Date.now() + appConfig.PASSWD_RESET_TOKEN_EXPIRES_IN * 60 * 1000;

    return resetToken;
  }
}

// const userSchema = new Schema<UserObject>(
//   {
//     [UserFields.NAME]: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     [UserFields.EMAIL]: {
//       type: String,
//       required: true,
//       trim: true,
//       lowercase: true,
//       unique: true
//     },
//     [UserFields.PHOTO]: {
//       type: String,
//       default: appConfig.DEFAULT_USER_AVATAR
//     },
//     [UserFields.ROLE]: {
//       type: String,
//       enum: UserRoles,
//       default: UserRoles.USER
//     },
//     [UserFields.PASSWD]: {
//       type: String,
//       required: true,
//       minlength: appConfig.USER_PASSWD_MIN_LENGTH,
//       select: false
//     },
//     [UserFields.PASSWD_CHANGED_AT]: Date,
//     [UserFields.PASSWD_RESET_TOKEN]: String,
//     [UserFields.PASSWD_RESET_EXPIRES]: Date,
//     [UserFields.ACTIVE]: {
//       type: Boolean,
//       default: true,
//       select: false
//     }
//   },
//   { timestamps: true }
// );

// userSchema.pre(/^find/, function (next): void {
//   this.find({
//     active: { $ne: false },
//   }).select("-__v -passwdResetExpires -passwdResetToken");

//   next();
// });

// export const User = model<UserDoc>(ModelTableNames.USER, userSchema);
