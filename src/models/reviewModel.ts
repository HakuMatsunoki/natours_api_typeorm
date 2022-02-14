import { model, Schema } from "mongoose";

import { appConfig } from "../configs";
import { ModelTableNames } from "../constants";
// import { Tour } from "./tourModel";

export interface ReviewObject {
  review: string;
  rating: number;
  cratedAt: Date;
  tour: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
}

const reviewSchema = new Schema<ReviewObject>(
  {
    review: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: appConfig.RATING_MIN,
      max: appConfig.RATING_MAX
    },
    cratedAt: {
      type: Date,
      default: new Date(Date.now())
    },
    tour: {
      type: Schema.Types.ObjectId,
      ref: ModelTableNames.TOUR,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: ModelTableNames.USER,
      required: true
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const Review = model<ReviewObject>(ModelTableNames.REVIEW, reviewSchema);
