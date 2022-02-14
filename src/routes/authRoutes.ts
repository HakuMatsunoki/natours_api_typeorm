import express from "express";

import * as authController from "../controllers/authController";
import * as authMiddleware from "../middlewares/authMiddleware";

const router = express.Router();

router.post(
  "/signup",
  authMiddleware.isUserDataValid,
  authMiddleware.isNotEmailExist,
  authController.signup
);
router.post("/login", authMiddleware.isAuthenticated, authController.login);
router.post("/logout", authMiddleware.protectRoute, authController.logout);
router.post(
  "/logoutAll",
  authMiddleware.protectRoute,
  authController.logoutAll
);
router.post("/refresh", authMiddleware.checkRefresh, authController.refresh);
router.post(
  "/forgotPasswd",
  authMiddleware.isAccountExist,
  authController.forgotPasswd
);
router.post(
  "/resetPasswd/:token",
  authMiddleware.isPasswdValid,
  authController.resetPasswd
);

export { router as authRouter };
