import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  registerCustomer,
  registerValidation,
  loginValidation,
  forgotPassword,
  forgotPasswordValidation,
  resetPassword,
  resetPasswordValidation,
  logoutUser,
  createAdmin,
  registerDesigner,
  updateProfile,
} from "../controllers/auth.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { uploadProfileImage } from "../middlewares/upload.js";

const authRouter = Router();

// Admin routes
authRouter.post("/admin/register", registerValidation, createAdmin);

// Customer routes
authRouter.post(
  "/customer/register",
  uploadProfileImage,
  registerValidation,
  registerCustomer,
);

// Designer routes
authRouter.post(
  "/designer/register",
  uploadProfileImage,
  registerValidation,
  registerDesigner,
);

// Authentication routes
authRouter.post("/login", loginValidation, loginUser);
authRouter.post("/logout", isAuthenticated, logoutUser);

// User profile routes
authRouter.get("/user", isAuthenticated, getCurrentUser);
authRouter.put(
  "/user/profile",
  isAuthenticated,
  uploadProfileImage,
  updateProfile,
);

// Password reset routes
authRouter.post("/forgot-password", forgotPasswordValidation, forgotPassword);
authRouter.post(
  "/reset-password/:token",
  resetPasswordValidation,
  resetPassword,
);

export default authRouter;
