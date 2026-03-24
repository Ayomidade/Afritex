import { config } from "dotenv";
import app from "./app.js";
import sequelize from "./MySql/config/db.js";

config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    await sequelize.sync({ alter: true }); // ✅ safe — updates schema, never deletes data
    console.log("All models synchronized.");

    // ✅ RENDER FIX: Bind to '0.0.0.0' + explicit PORT
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Afritex server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
};

startServer();
