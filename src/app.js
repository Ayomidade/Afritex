import express, { json, urlencoded } from "express";
import authRouter from "./routes/auth.route.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";

const app = express();
app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ status: "Success", message: "Welcome to Afritex API" });
});

app.use("/auth/", rateLimiter, authRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
