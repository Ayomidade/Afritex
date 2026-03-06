
import { DataTypes } from "sequelize";
import sequelize from "./src/MySql/config/db.js";

import  { User, Product, Order, OrderItem } from './relationship.js';  // ensures models + relations are loaded

async function syncDB() {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL");

    await sequelize.sync({ alter: true }); 
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error connecting to MySQL:", error);
  }
}

syncDB();