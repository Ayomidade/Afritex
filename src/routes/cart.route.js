import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  addtoCart,
  addToCartValidation,
  clearCart,
  getMyCart,
  removeCartItem,
  updateCartItem,
  updateCartValidation,
} from "../controllers/cart.controller.js";

const cartRouter = Router();
cartRouter.use(isAuthenticated);

cartRouter.post("/", addToCartValidation, addtoCart);
cartRouter.get("/", getMyCart);
cartRouter.put("/item/:id", updateCartValidation, updateCartItem);
cartRouter.delete("/item/:id", removeCartItem);
cartRouter.delete("/", clearCart);

export default cartRouter;