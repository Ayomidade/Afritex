import { DataTypes } from "sequelize";
import sequelize from "./src/MySql/config/db.js";


const Store = sequelize.define(
  'Store',
  {
    storeid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    storeName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        Unique: true
    }  
  },
);

export default Store;