import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  registerValidation,
  loginValidation,
  forgotPassword,
  forgotPasswordValidation,
  resetPassword,
  resetPasswordValidation,
  logoutUser,
} from "../controllers/auth.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { uploadProfileImage } from "../middlewares/upload.js";

const authRouter = Router();

authRouter.post("/register", uploadProfileImage, registerValidation, registerUser);
authRouter.post("/login", loginValidation, loginUser);
authRouter.get("/user", isAuthenticated, getCurrentUser);
authRouter.post("/forgot-password", forgotPasswordValidation, forgotPassword);
authRouter.post("/reset-password/:token", resetPasswordValidation, resetPassword);
authRouter.post("/logout", isAuthenticated, logoutUser); 

export default authRouter;
