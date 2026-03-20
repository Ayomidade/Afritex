import { Router } from "express";
import { isAuthorized } from "../middlewares/isAuthorized.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  // getProductByStore,
  getSingleProduct,
  updateProduct,
} from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.post(
  "/",
  isAuthenticated,
  isAuthorized("designer"),
  createProduct,
);

productRouter.get("/", getAllProducts);
productRouter.get("/:id", getSingleProduct);
productRouter.put(
  "/:id",
  isAuthenticated,
  isAuthorized("designer"),
  updateProduct,
);
productRouter.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("designer", "admin"),
  deleteProduct,
);
// productRouter.get("/store/:storeId", getProductByStore);

export default productRouter;
