import { DataTypes } from "sequelize";
import sequelize from "../MySql/config/db.js";

// Represent the entire purchase
const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
   
    totalAmount: {
      type: DataTypes.FLOAT,
    },
    // dateOrdered: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    // },
  },
  { timestamps: true },
);

export default Order;
