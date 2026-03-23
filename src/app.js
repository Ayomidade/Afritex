import express, { json, urlencoded } from "express";
import authRouter from "./routes/auth.route.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";
import rateLimit from "express-rate-limit";
import userRouter from "./routes/user.route.js";
import designerRouter from "./routes/designer.route.js";
import productRouter from "./routes/product.route.js";
import storeRouter from "./routes/store.route.js";
import adminRouter from "./routes/admin.route.js";
import cartRouter from "./routes/cart.route.js";
import "../relationship.js";

const app = express();
app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ status: "Success", message: "Welcome to Afritex API" });
});

app.use("/api/auth/", authRouter);
app.use("/api/user/", userRouter);
app.use("/api/designer", designerRouter);
app.use("/api/products", productRouter);
app.use("/api/stores", storeRouter);
app.use("/api/admin", adminRouter);
app.use("/api/cart", cartRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
