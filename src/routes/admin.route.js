import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAuthorized.js";
import {
  deleteProduct,
  deleteStore,
  deleteUser,
  getAllDesigners,
  getAllProducts,
  getAllStores,
  getAllUsers,
  verifyDesigners,
} from "../controllers/admin.controller.js";

const adminRouter = Router();
adminRouter.use(isAuthenticated);
adminRouter.use(isAdmin);

adminRouter.get("/users", getAllUsers);
adminRouter.get("/designers", getAllDesigners);
adminRouter.get("/stores", getAllStores);
adminRouter.get("/products", getAllProducts);
adminRouter.patch("/verify-designer/:id", verifyDesigners);
adminRouter.delete("/products/:id", deleteProduct);
adminRouter.delete("/stores/:id", deleteStore);
// adminRouter.delete("/users/:id", deleteUser)
export default adminRouter;
