import express from "express";
import { createOrder } from "../controllers/order.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Create new order
router.post("/", isAuthenticated, createOrder);

export default router;