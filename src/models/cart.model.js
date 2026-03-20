import { DataTypes } from "sequelize";
import sequelize from "../MySql/config/db.js";

const Cart = sequelize.define(
  "Cart",
  {
    cartId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { timestamps: true },
);

export default Cart;
