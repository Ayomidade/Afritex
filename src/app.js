import express, { json, urlencoded } from "express";
import authRouter from "./routes/auth.route.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";
import rateLimit from "express-rate-limit";
import userRouter from "./routes/user.route.js";
import designerRouter from "./routes/designer.route.js";

const app = express();
app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ status: "Success", message: "Welcome to Afritex API" });
});

app.use("/api/auth/", rateLimit, authRouter);
app.use("/api/user/", userRouter);
app.use("/api/designer", designerRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
