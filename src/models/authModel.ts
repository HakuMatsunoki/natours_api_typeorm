
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm";

// import { appConfig } from "../configs";
// // import { ModelTableNames, UserFields, UserRoles } from "../constants";
import { User } from "./userModel";


export interface AuthObject {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Entity()
export class Auth extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  accessToken!: string;

  @Column()
  refreshToken!: string;

  @ManyToOne(() => User)
  user!: User;
}


// const authSchema: Schema = new Schema<AuthObject>(
//   {
//     accessToken: {
//       type: String,
//       required: true
//     },
//     refreshToken: {
//       type: String,
//       required: true
//     },
//     user: {
//       type: Schema.Types.ObjectId,
//       required: true,
//       ref: ModelTableNames.USER
//     }
//   },
//   { timestamps: true }
// );

// export const Auth = model<AuthObject>(ModelTableNames.AUTH, authSchema);
