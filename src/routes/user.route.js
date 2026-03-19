import { Router } from "express";
import {
  deleteUserAccount,
  getAllUsers,
  getUserById,
  getUserProfile,
  updateProfileImage,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { isAdmin } from "../middlewares/isAuthorized.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { uploadProfileImage } from "../middlewares/upload.js";

const userRouter = Router();
userRouter.use(isAuthenticated);

userRouter.get("/profile", getUserProfile);

userRouter.put("/profile", updateUserProfile);

userRouter.delete("/", deleteUserAccount);

userRouter.get("/", isAdmin, getAllUsers);

userRouter.get("/:userId", isAdmin, getUserById);
userRouter.put("/profile/image", uploadProfileImage, updateProfileImage);

export default userRouter;
