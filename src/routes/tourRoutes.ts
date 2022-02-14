import express from "express";

import * as tourController from "../controllers/tourController";
import * as authMiddleware from "../middlewares/authMiddleware";
import * as tourMiddleware from "../middlewares/tourMiddleware";
import { UserRoles } from "../constants";

const router = express.Router();

// router.use('/:tourId/reviews', reviewRouter);

// router
//   .route('/top-3-cheap')
//   .get(tourController.aliasTopTours, tourController.getAllTours);

// router.route('/tour-stats').get(tourController.getTourStats);

// router
//   .route('/monthly-plan/:year')
//   .get(
//     authController.protect,
//     authController.restrictTo('admin', 'lead-guide', 'guide'),
//     tourController.getMonthlyPlan
//   );

// router
//   .route('/tours-within/:distance/center/:latlng/unit/:unit')
//   .get(tourController.getToursWithin);
// // /tours-within/233/center/34.111745,-118.113491/unit/mi
// // /tours-within?distance=233&center=-40,45&unit=mi

// router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authMiddleware.protectRoute,
    authMiddleware.restrictTo(UserRoles.ADMIN, UserRoles.LEAD_GUIDE),
    tourMiddleware.filterCreateTourObject,
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    tourMiddleware.checkTourId,
    authMiddleware.protectRoute,
    authMiddleware.restrictTo(UserRoles.ADMIN, UserRoles.LEAD_GUIDE),
    tourMiddleware.filterUpdateTourObject,
    tourMiddleware.checkTourImage,
    tourMiddleware.uploadImage,
    tourController.updateTour
  )
  .delete(
    tourMiddleware.checkTourId,
    authMiddleware.protectRoute,
    authMiddleware.restrictTo(UserRoles.ADMIN, UserRoles.LEAD_GUIDE),
    tourController.deleteTour
  );

export { router as tourRouter };
