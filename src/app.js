import express, { json, urlencoded } from "express";

const app = express();
app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({status:"Success", message: "Welcome to Afritex API" });
})

export default app;
