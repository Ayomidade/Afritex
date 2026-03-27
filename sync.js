import sequelize from "./MySql/config/db.js";
import "../relationship.js";

async function syncModels() {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced successfully with alterations");
    process.exit(0);
  } catch (err) {
    console.error("❌ Sync error:", err.message);
    
    // Check if it's the foreign key error
    if (err.message.includes("Can't DROP") || err.message.includes("ER_CANT_DROP_FIELD_OR_KEY")) {
      console.log("\n🔧 Attempting to fix foreign key issue...");
      
      try {
        // Try to drop the constraint directly if it exists
        await sequelize.query("ALTER TABLE Stores DROP FOREIGN KEY Stores_ibfk_1;");
        console.log("✅ Dropped problematic foreign key");
        
        // Try sync again
        await sequelize.sync({ alter: true });
        console.log("✅ Database synced successfully on second attempt");
        process.exit(0);
      } catch (fixErr) {
        console.error("❌ Could not automatically fix:", fixErr.message);
        console.log("\n📝 Manual fix required:");
        console.log("1. Connect to your Railway MySQL database");
        console.log("2. Run: SHOW CREATE TABLE Stores;");
        console.log("3. Manually drop or add the foreign key constraint");
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
}

syncModels();
