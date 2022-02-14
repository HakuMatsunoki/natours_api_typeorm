import { model, Schema } from "mongoose";
import slugify from "slugify";

import { appConfig } from "../configs";
import {
  LocationFields,
  ModelTableNames,
  TourDifficulties,
  TourFields
} from "../constants";
// import { UserObject } from "./userModel";
// import { mustHaveMsg, mustBeMsg } from "../utils";

export interface TourObject {
  [TourFields.NAME]: string;
  [TourFields.SLUG]: string;
  [TourFields.DURATION]: number;
  [TourFields.MAX_GROUP]: number;
  [TourFields.DIFFICULTY]: string;
  [TourFields.RAT_AVG]: number;
  [TourFields.RAT_QNT]: number;
  [TourFields.PRICE]: number;
  [TourFields.DISCOUNT]: number;
  [TourFields.SUMM]: string;
  [TourFields.DESC]?: string;
  [TourFields.COVER]: string;
  [TourFields.IMGS]: Array<string>;
  [TourFields.CREATED]: Date;
  [TourFields.START_DATES]: Array<Date>;
  [TourFields.SECRET]: boolean;
  [TourFields.START_LOCATION]: Location;
  [TourFields.LOCATIONS]: Array<Location>;
  [TourFields.GUIDES]: Array<Schema.Types.ObjectId>;
}

export interface Location {
  [LocationFields.TYPE]: string;
  [LocationFields.COORDS]: Array<number>;
  [LocationFields.ADDR]: string;
  [LocationFields.DESC]: string;
  [LocationFields.DAY]?: number;
}

const tourSchema: Schema = new Schema<TourObject>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: appConfig.TOUR_NAME_MAX_LENGTH,
      minlength: appConfig.TOUR_NAME_MIN_LENGTH
    },
    slug: String,
    duration: {
      type: Number,
      required: true
    },
    maxGroupSize: {
      type: Number,
      required: true
    },
    difficulty: {
      type: String,
      required: true,
      enum: TourDifficulties
    },
    ratingsAverage: {
      type: Number,
      default: appConfig.RATING_DEFAULT,
      min: appConfig.RATING_MIN,
      max: appConfig.RATING_MAX,
      set: (val: number): number => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: true
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (this: TourObject, val: number): boolean {
          return val < this.price;
        }
      }
    },
    summary: {
      type: String,
      trim: true,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String
    },
    images: [String],
    createdAt: {
      type: Date,
      default: new Date(Date.now()),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: Schema.Types.ObjectId,
        ref: ModelTableNames.USER
      }
    ]
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.virtual("durationWeeks").get(function (this: TourObject): string {
  return (this.duration / 7).toFixed(1);
});

tourSchema.pre("save", function (next): void {
  this.slug = slugify(this.name, { lower: true });

  next();
});

tourSchema.pre(/^find/, function (next): void {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt"
  });

  next();
});

export const Tour = model<TourObject>(ModelTableNames.TOUR, tourSchema);
