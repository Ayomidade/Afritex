import dotenv from "dotenv";
dotenv.config();

import sequelize from "../MySql/config/db.js";

import User from "./user.model.js";
import Product from "./product.model.js";
import Store from "./store.model.js";
import Order from "./order.model.js";
import OrderItem from "./order_items.model.js";
import Cart from "./cart.model.js";
import CartItem from "./cartItem.model.js";

/* =========================
   USER ↔ STORE
========================= */
User.hasOne(Store, { foreignKey: "userId", as: "store" });
Store.belongsTo(User, { foreignKey: "userId", as: "owner" });

/* =========================
   USER ↔ PRODUCT
========================= */
User.hasMany(Product, { foreignKey: "designerId", as: "products" });
Product.belongsTo(User, {
  foreignKey: "designerId",
  as: "designer",
  targetKey: "userId",
});

/* =========================
   STORE ↔ PRODUCT
========================= */
Store.hasMany(Product, { foreignKey: "storeId", as: "products" });
Product.belongsTo(Store, { foreignKey: "storeId", as: "store" });

/* =========================
   USER ↔ ORDER
========================= */
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "customer" });

/* =========================
   ORDER ↔ ORDER ITEMS
========================= */
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

/* =========================
   CART SYSTEM (FIXED + STABLE)
========================= */
User.hasOne(Cart, { foreignKey: "userId", as: "cart" });

Cart.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Cart.hasMany(CartItem, {
  foreignKey: "cartId",
  as: "items",   // 👈 CRITICAL: matches your include
});

CartItem.belongsTo(Cart, {
  foreignKey: "cartId",
  as: "cart",
});

/* =========================
   CART ITEM ↔ PRODUCT (FIXED)
========================= */
Product.hasMany(CartItem, {
  foreignKey: "productId",
  as: "cartItems",
});

CartItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",  // 👈 CRITICAL: must match include
});



export default sequelize;