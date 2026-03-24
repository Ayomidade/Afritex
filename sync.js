import sequelize from "./MySql/config/db.js";
import "../relationship.js"; // ensures all associations are loaded

async function syncModels() {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");
    process.exit(0);
  } catch (err) {
    console.error("Sync error:", err);
    process.exit(1);
  }
}

syncModels();




