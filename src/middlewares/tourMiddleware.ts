import { RequestHandler } from "express";
import { UploadedFile } from "express-fileupload";

import { RequestExt } from "../common";
import { appConfig } from "../configs";
import {
  // Messages,
  // StatusCodes,
  LocationFields,
  TourFields
} from "../constants";
import * as factory from "./handlerFactory";
import { Tour } from "../models";
import { s3BucketUpload, imageSharper } from "../services";
import {
  AppError,
  catchAsync,
  fileNameBuilder,
  FileName,
  filterRequestObject,
  imageCheckHelper
} from "../utils";
import {
  // paramsValidators,
  tourRegularValidators
  // userStrictValidators
} from "../validators";

interface Location {
  [LocationFields.TYPE]?: string;
  [LocationFields.COORDS]?: number[];
  [LocationFields.DESC]?: string;
  [LocationFields.DAY]?: number;
  [LocationFields.ADDR]?: string;
}

const allowedFields: string[] = [
  TourFields.NAME,
  TourFields.DURATION,
  TourFields.MAX_GROUP,
  TourFields.DIFFICULTY,
  TourFields.PRICE,
  TourFields.SUMM,
  TourFields.DESC,
  TourFields.START_DATES,
  TourFields.START_LOCATION,
  TourFields.LOCATIONS,
  TourFields.SECRET,
  TourFields.GUIDES
];

export const filterCreateTourObject: RequestHandler = (req, _res, next) => {
  req.body = filterRequestObject(
    req.body,
    allowedFields,
    tourRegularValidators
  );

  if (req.body.locations) {
    req.body.locations.forEach((location: Location) => {
      location[LocationFields.TYPE] = "Point";
    });
  }

  if (req.body.startLocation) {
    req.body.startLocation[LocationFields.TYPE] = "Point";
  }

  next();
};

export const filterUpdateTourObject: RequestHandler = (req, _res, next) => {
  req.body = filterRequestObject(
    req.body,
    allowedFields,
    tourRegularValidators
  );

  next();
};

export const checkTourId: RequestHandler = factory.checkModelById(Tour);

export const checkTourImage: RequestHandler = (req: RequestExt, _res, next) => {
  const data: UploadedFile | UploadedFile[] | undefined = req.files?.photo;

  if (!data) return next();

  const dataArr: UploadedFile[] = Array.isArray(data) ? data : [data];

  for (const img of dataArr) {
    const error: AppError | undefined = imageCheckHelper(
      img,
      appConfig.IMG_MAX_SIZE
    );

    if (error) return next(error);
  }

  req.photo = dataArr;

  next();
};

export const uploadImage: RequestHandler = catchAsync(
  async (req: RequestExt, _res, next) => {
    const imgs = req.photo as UploadedFile[];

    if (!imgs || !imgs.length) return next();

    const id: string = req.params.id;
    const imgList: string[] = [];

    for (const img of imgs) {
      const fileNameObj: FileName = fileNameBuilder("jpg", "tours", id);
      imgList.push(fileNameObj.path);

      const sharpedPhoto: Buffer = await imageSharper(img, {
        height: appConfig.TOUR_IMG_HEIGHT,
        width: appConfig.TOUR_IMG_WIDTH
      });
      await s3BucketUpload(fileNameObj.path, img.mimetype, sharpedPhoto);
    }

    req.body.images = imgList;

    next();
  }
);
