import { Router } from "express";
import {
  createStore,
  deleteStore,
  getAllStore,
  getMyStore,
  getStoreById,
  getStoreProducts,
  updateStore,
} from "../controllers/store.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const storeRouter = Router();

storeRouter.post("/", isAuthenticated, createStore);
storeRouter.get("/", getAllStore);
storeRouter.get("/:id", getStoreById);
storeRouter.get("/me", isAuthenticated, getMyStore);
storeRouter.put("/:id", isAuthenticated, updateStore);
storeRouter.delete("/:id", isAuthenticated, deleteStore);
storeRouter.get("/:id/products", getStoreProducts);

export default storeRouter;
