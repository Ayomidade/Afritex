import Sequelize from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DBNAME,
  process.env.DBUSER,
  process.env.DBPASSWORD,
  {
    host: process.env.DBHOST,
    port: Number(process.env.DBPORT),
    dialect: 'mysql',
    logging: false,
    // ADD THESE TIMEOUTS
    dialectOptions: {
      connectTimeout: 60000,  // 60 seconds
      acquireTimeout: 60000,
      timeout: 60000
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    }
  }
);

export default sequelize;



