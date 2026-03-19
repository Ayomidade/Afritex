
import { DataTypes } from "sequelize";
import sequelize from "../MySql/config/db.js";

const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    priceAtPurchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
orderId: {
  type: DataTypes.INTEGER,
  allowNull: false
}
  }
);

export default OrderItem