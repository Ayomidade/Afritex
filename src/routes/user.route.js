import express from "express";
// import auth from "../middleware/auth.middleware.js";
import {
  getUserProfile,
  getUserDashboard,
  updateUserProfile,
  deleteUserAccount,
  getAllUsers,
  getUserById,
  updateProfileImage,
} from "../controllers/user.controller.js";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import { uploadProfileImage } from "../middlewares/upload.js";

const userRouter = express.Router();

userRouter.use(isAuthenticated);
userRouter.get("/profile", getUserProfile);
userRouter.get("/dashboard", getUserDashboard);

userRouter.put("/profile/:id", updateUserProfile);

userRouter.delete("/", deleteUserAccount);

userRouter.get("/", getAllUsers);

userRouter.get("/:id", getUserById);
userRouter.put("/profile/image", uploadProfileImage, updateProfileImage);

export default userRouter;
