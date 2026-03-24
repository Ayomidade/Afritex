import dotenv from "dotenv";
dotenv.config();

import sequelize from "./src/MySql/config/db.js";

import User from "./src/models/user.model.js";
import Product from "./src/models/product.model.js";
import Store from "./src/models/store.model.js";
import Order from "./src/models/order.model.js";
import OrderItem from "./src/models/order_items.model.js";
import Cart from "./src/models/cart.model.js";
import CartItem from "./src/models/cartItem.model.js";

// =============================
// USER ↔ STORE
// =============================

// One designer (user) has one store
User.hasOne(Store, {
  foreignKey: "userId",
  as: "store",
});

Store.belongsTo(User, {
  foreignKey: "userId",
  as: "owner",
});

// =============================
// USER ↔ PRODUCT (DESIGNER)
// =============================

// Designer (User) creates many products
User.hasMany(Product, {
  foreignKey: "designerId",
  as: "products",
});

Product.belongsTo(User, {
  foreignKey: "designerId",
  as: "designer",
});

// =============================
// STORE ↔ PRODUCT
// =============================

// One store has many products
Store.hasMany(Product, {
  foreignKey: "storeId",
  as: "products",
});

Product.belongsTo(Store, {
  foreignKey: "storeId",
  as: "store",
});

// =============================
// USER ↔ ORDER
// =============================

// A user can place many orders
User.hasMany(Order, {
  foreignKey: "userId",
  as: "orders",
});

Order.belongsTo(User, {
  foreignKey: "userId",
  as: "customer",
});

// =============================
// ORDER ↔ ORDER ITEMS
// =============================

// One order contains many order items
Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

// =============================
// PRODUCT ↔ ORDER ITEMS
// =============================

// One product can appear in many order items
Product.hasMany(OrderItem, {
  foreignKey: "productId",
  as: "orderItems",
});

OrderItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

// =============================
// USER ↔ CART
// =============================

// Each user has one cart
User.hasOne(Cart, {
  foreignKey: "userId",
  as: "cart",
});

Cart.belongsTo(User, {
  foreignKey: "userId",
});

// =============================
// CART ↔ CART ITEMS
// =============================

// One cart has many items
Cart.hasMany(CartItem, {
  foreignKey: "cartId",
  as: "items",
});

CartItem.belongsTo(Cart, {
  foreignKey: "cartId",
});

// =============================
// PRODUCT ↔ CART ITEMS
// =============================

// A product can appear in many carts
Product.hasMany(CartItem, {
  foreignKey: "productId",
});

CartItem.belongsTo(Product, {
  foreignKey: "productId",
});

// =============================
// DATABASE SYNC
// =============================

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced successfully");
  })
  .catch((err) => {
    console.error("Database sync error:", err);
  });

export default sequelize;

