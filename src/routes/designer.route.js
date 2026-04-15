import { Router } from "express";
import {
  getDesignerProfile,
  getAllDesigners,
  getDesignerProducts,
  updateDesignerProfile,
  verifyDesigner,
} from "../controllers/designer.controller.js";
import { isAdmin, isAuthorized } from "../middlewares/isAuthorized.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const designerRouter = Router();
// designerRouter.use(isAuthenticated)
designerRouter.get("/", getAllDesigners);

designerRouter.get("/:id", getDesignerProfile);

designerRouter.get("/:id/products", getDesignerProducts);

designerRouter.put(
  "/me",
  isAuthenticated,
  isAuthorized("designer"),
  updateDesignerProfile,
);

designerRouter.patch("/:id/verify", isAuthenticated, isAdmin, verifyDesigner);

export default designerRouter;
