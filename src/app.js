import express, { json, urlencoded } from "express";
import authRouter from "./routes/auth.route.js";

const app = express();
app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ status: "Success", message: "Welcome to Afritex API" });
});

app.use("/auth/", authRouter);

export default app;
