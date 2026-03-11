import sequelize from "../MySql/config/db.js";   // ✔ correct path, correct case
import Relationships from "./relationship.js";      // ✔ correct file extension

async function syncModels() {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database schema synced to codebase.");
    process.exit(0);
  } catch (err) {
    console.error("Sync error:", err);
    process.exit(1);
  }
}

syncModels();

