import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmailUser,
  getGoogleLoginPage,
  getGoogleLoginCallback,
  getMicrosoftLoginPage,
  getMicrosoftLoginCallback,
  handleForgotPassword,
  handleResetPassword,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/verify-email", verifyEmailUser);
router.get("/google", getGoogleLoginPage);
router.get("/google/callback", getGoogleLoginCallback);
router.get("/microsoft", getMicrosoftLoginPage);
router.get("/microsoft/callback", getMicrosoftLoginCallback);
router.post("/forgot-password", handleForgotPassword);
router.post("/reset-password", handleResetPassword);

router.get("/me", authMiddleware, getCurrentUser);

export default router;
