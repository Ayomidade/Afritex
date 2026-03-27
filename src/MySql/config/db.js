import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.MYSQL_PUBLIC_URL;


const sequelize = new Sequelize(databaseUrl, {
  dialect: "mysql",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
  dialectOptions: {
    connectTimeout: 60000,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

export default sequelize;
