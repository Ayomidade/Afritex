
import { DataTypes } from "sequelize";
import sequelize from "./src/MySql/config/db.js";


const Product = sequelize.define(
  'Product',
  {
    productid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productDescription:{
      type: DataTypes.TEXT,
      allowNull: false
    },
    designerId:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productStatus:{
      type: DataTypes.STRING,
      allowNull: false
    }
  },
);

export default Product;