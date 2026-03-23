import { config } from "dotenv";
import app from "./app.js";
import sequelize from "./MySql/config/db.js"; 

config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    
    await sequelize.sync({ alter: true });
    console.log("All models synchronized.");

    
    app.listen(PORT, () => {
      console.log(`Afritex server is running http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Unable to start server:", error);
  }
};

startServer();