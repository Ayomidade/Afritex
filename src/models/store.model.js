import { DataTypes } from "sequelize";
import sequelize from "../MySql/config/db.js";

const Store = sequelize.define("Store", {
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  storeName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  storeDescription: {
    type: DataTypes.TEXT,
  },
  socialLinks: {
    type: DataTypes.JSON,
  },
  storeLogo: {
    type: DataTypes.STRING,
  },
  storebanner: {
    type: DataTypes.STRING,
  },
  designerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    Unique: true,
  },
});

export default Store;
