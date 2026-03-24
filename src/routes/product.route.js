import { Router } from "express";
import { isAuthorized } from "../middlewares/isAuthorized.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createProduct,
  createProductValidation,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  updateProductValidation,
} from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.post(
  "/",
  isAuthenticated,
  isAuthorized("designer"),
  createProductValidation,
  createProduct,
);

productRouter.get("/", getAllProducts);
productRouter.get("/:id", getSingleProduct);

productRouter.put(
  "/:id",
  isAuthenticated,
  isAuthorized("designer"),
  updateProductValidation,
  updateProduct,
);

productRouter.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("designer", "admin"),
  deleteProduct,
);

export default productRouter;