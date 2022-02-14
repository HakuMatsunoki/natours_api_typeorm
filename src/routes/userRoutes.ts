import express from "express";

import * as userController from "../controllers/userController";
import * as userMiddleware from "../middlewares/userMiddleware";
import * as authController from "../controllers/authController";
import * as authMiddleware from "../middlewares/authMiddleware";

import { UserRoles } from "../constants";

const router = express.Router();

// public
router.get("/:id/photo/:name", userController.getPhoto);

// protected
router.use(authMiddleware.protectRoute);

router.get("/me", userController.getMe);
router.patch("/updateMyPasswd", authController.updateMyPasswd);
router.patch(
  "/updateMe",
  userMiddleware.filterUpdateUserObject,
  userMiddleware.checkUserPhoto,
  userMiddleware.uploadPhoto,
  userController.updateMe
);
router.delete("/deleteMe", userController.deleteMe);

// restrict to admin
router.use(authMiddleware.restrictTo(UserRoles.ADMIN));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(
    userMiddleware.filterCreateUserObject,
    userMiddleware.sendTempUserCreds,
    userController.createUser
  );

router
  .route("/:id")
  .all(userMiddleware.checkId)
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export { router as userRouter };
