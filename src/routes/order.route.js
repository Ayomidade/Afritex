import express from "express";
import {
  createOrder,
  createOrderValidation,
  getMyOrders,
  getSingleOrder,
} from "../controllers/order.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/", isAuthenticated, createOrderValidation, createOrder);
router.get("/", isAuthenticated, getMyOrders);
router.get("/:id", isAuthenticated, getSingleOrder);

export default router;