import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  `mysql://root:kUyVsOAVHdksExrEhrCfMMVPNqQSRcyT@centerbeam.proxy.rlwy.net:27320/railway`,
  {
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
    },
  }
);

export default sequelize;