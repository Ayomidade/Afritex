import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../controllers/auth.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/user", isAuthenticated, getCurrentUser);

export default authRouter;
