import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../controllers/auth.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { uploadProfileImage } from "../middlewares/upload.js";

const authRouter = Router();

authRouter.post("/register", uploadProfileImage, registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/user", isAuthenticated, getCurrentUser);

export default authRouter;
