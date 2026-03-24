import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAuthorized.js";
import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllCustomers,
  getSingleCustomer,
  getAllDesigners,
  verifyDesigners,
  getAllStores,
  deleteStore,
  getAllProducts,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/admin.controller.js";

const adminRouter = Router();
adminRouter.use(isAuthenticated);
adminRouter.use(isAdmin);

// dashboard
adminRouter.get("/dashboard", getDashboardStats);

// users
adminRouter.get("/users", getAllUsers);
adminRouter.delete("/users/:id", deleteUser);

// customers
adminRouter.get("/customers", getAllCustomers);
adminRouter.get("/customers/:id", getSingleCustomer);

// designers
adminRouter.get("/designers", getAllDesigners);
adminRouter.patch("/verify-designer/:id", verifyDesigners);

// stores
adminRouter.get("/stores", getAllStores);
adminRouter.delete("/stores/:id", deleteStore);

// products
adminRouter.get("/products", getAllProducts);
adminRouter.delete("/products/:id", deleteProduct);

// orders
adminRouter.get("/orders", getAllOrders);
adminRouter.patch("/orders/:id/status", updateOrderStatus);

export default adminRouter;