import dotenv from "dotenv";
dotenv.config();
import sequelize from './src/MySql/config/db.js';

import User from "./src/models/user.model.js";
import Product from "./src/models/product.model.js";
import Order from "./src/models/order.model.js";
import OrderItem from "./src/models/order_items.model.js";
import Store from "./src/models/store.model.js"

// Designer (User) -> many Products
User.hasMany(Product, {
  foreignKey: 'designerId',
  as: 'products',
});
Product.belongsTo(User, {
  foreignKey: 'designerId',
  as: 'designer',
  targetKey: 'userid',
});

//one store has many products
Store.hasMany(Product, {
  foreignKey: "storeId",
  as: "products"
});

Product.belongsTo(Store, {
  foreignKey: "storeId",
  as: "store"
});

// every designer has one user
User.hasOne(Store, {
  foreignKey: "userId",
  as: "store"
});

Store.belongsTo(User, {
  foreignKey: "userId",
  as: "owner"
}); 

// Order -> many OrderItems
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
});
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});

// User -> many Orders
User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
});
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'customer',
  targetKey: 'userid',
});

export default Relationships;

