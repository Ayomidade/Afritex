import dotenv from "dotenv";
dotenv.config();
import sequelize from "./src/MySql/config/db.js";

import User from "./src/models/user.model.js";
import Product from "./src/models/product.model.js";
import Order from "./src/models/order.model.js";
import OrderItem from "./src/models/order_items.model.js";
import Store from "./src/models/store.model.js"

User.hasMany(Product, {
  foreignKey: 'designerId',
  as: 'products',
});
Product.belongsTo(User, {
  foreignKey: 'designerId',
  as: 'designer',
  targetKey: 'userid',
});


Store.hasMany(Product, {
  foreignKey: "storeId",
  as: "products"
});

Product.belongsTo(Store, {
  foreignKey: "storeId",
  as: "store"
});


User.hasOne(Store, {
  foreignKey: "userId",
  as: "store"
});

Store.belongsTo(User, {
  foreignKey: "userId",
  as: "owner"
}); 


Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
});
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});


User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
});
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'customer',
  targetKey: 'userid',
});


