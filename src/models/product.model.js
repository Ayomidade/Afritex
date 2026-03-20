import { DataTypes } from "sequelize";
import sequelize from "../MySql/config/db.js";

const Product = sequelize.define(
  "Product",
  {
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    productPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
    },
    productImages: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { timestamps: true },
);

export default Product;
