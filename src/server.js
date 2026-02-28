import { config } from "dotenv";
import app from "./app.js";
config();

const PORT = process.env.PORT;

const startSever = async () => {
  app.listen(PORT, () => {
    console.log(`Afritex server is running http://localhost:${PORT}`);
  });
};

startSever()