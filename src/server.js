import { config } from "dotenv";
import app from "./app.js";
import sequelize from "./MySql/config/db.js";

config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("Attempting database connection...");
    console.log(`DB Config: ${process.env.MYSQLHOST}:${process.env.MYSQLPORT}`);

    // Test connection with longer timeout
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    // Sync models (creates tables)
    await sequelize.sync();
    console.log("✅ All models synchronized.");

    // RENDER PORT BINDING - CRITICAL
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Afritex server running on port ${PORT}`);
      console.log(`✅ Full API ready: https://afritex.onrender.com/`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        sequelize.close();
      });
    });

  } catch (error) {
    console.error("❌ Unable to start server:", error.message);
    
    // CRITICAL: Start server anyway for Render port detection
    console.log("🔄 Starting server without DB for Render port detection...");
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ Server running on port ${PORT} (DB offline)`);
    });
  }
};

startServer();
