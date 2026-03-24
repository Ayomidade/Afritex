import { Router } from "express";
import {
  createStore,
  createStoreValidation,
  deleteStore,
  getAllStore,
  getMyStore,
  getStoreById,
  getStoreProducts,
  updateStore,
  updateStoreValidation,
} from "../controllers/store.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isAuthorized } from "../middlewares/isAuthorized.js";

const storeRouter = Router();


storeRouter.get("/me", isAuthenticated, getMyStore);

storeRouter.post("/", isAuthenticated, isAuthorized("designer"), createStoreValidation, createStore);
storeRouter.get("/", getAllStore);
storeRouter.get("/:id", getStoreById);
storeRouter.put("/:id", isAuthenticated, isAuthorized("designer"), updateStoreValidation, updateStore);
storeRouter.delete("/:id", isAuthenticated, deleteStore);
storeRouter.get("/:id/products", getStoreProducts);

export default storeRouter;