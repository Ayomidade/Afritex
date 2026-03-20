import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  addtoCart,
  clearCart,
  getMyCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cart.controller.js";

const cartRouter = Router();
cartRouter.use(isAuthenticated);

cartRouter.post("/", addtoCart);
cartRouter.get("/", getMyCart);
cartRouter.put("/item/:id", updateCartItem);
cartRouter.delete("/item/:id", removeCartItem);
cartRouter.delete("/", clearCart);

export default cartRouter;
