
import { DataTypes } from "sequelize";
import sequelize from "./src/MySql/config/db.js";

// -------------------- MODELS --------------------

const User = sequelize.define("User", {
  userid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING
});

const Product = sequelize.define("Product", {
  name: DataTypes.STRING,
  designerId: DataTypes.INTEGER
});

const Order = sequelize.define("Order", {
  orderId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: DataTypes.INTEGER
});

const OrderItem = sequelize.define("OrderItem", {
  orderId: DataTypes.INTEGER,
  productId: DataTypes.INTEGER,
  quantity: DataTypes.INTEGER
});

// -------------------- ASSOCIATIONS --------------------

// Designer -> Products
User.hasMany(Product, {
  foreignKey: "designerId",
  as: "products",
});
Product.belongsTo(User, {
  foreignKey: "designerId",
  as: "designer",
  targetKey: "userid",
});

// Order -> OrderItems
Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
});
OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

// User -> Orders (customer)
User.hasMany(Order, {
  foreignKey: "userId",
  as: "orders",
});
Order.belongsTo(User, {
  foreignKey: "userId",
  as: "customer",
  targetKey: "userid",
});

// -------------------- TEST SCRIPT --------------------

(async () => {
  await sequelize.sync({ force: true });

  // Create sample users
  const designer = await User.create({ name: "Alice Designer" });
  const customer = await User.create({ name: "Bob Customer" });

  // Create product assigned to designer
  const product = await Product.create({
    name: "Stylish Shirt",
    designerId: designer.userid
  });

  // Create order by customer
  const order = await Order.create({
    userId: customer.userid,
  });

  // Add order items
  await OrderItem.create({
    orderId: order.orderId,
    productId: product.id,
    quantity: 2,
  });

  // -------------------- CHECK ASSOCIATIONS --------------------

  console.log("\n=== Fetch Designer with Products ===");
  const designerWithProducts = await User.findByPk(designer.userid, {
    include: { model: Product, as: "products" }
  });
  console.log(JSON.stringify(designerWithProducts, null, 2));

  console.log("\n=== Fetch Order with Items ===");
  const orderWithItems = await Order.findByPk(order.orderId, {
    include: { model: OrderItem, as: "items" }
  });
  console.log(JSON.stringify(orderWithItems, null, 2));

  console.log("\n=== Fetch Customer with Orders ===");
  const customerWithOrders = await User.findByPk(customer.userid, {
    include: { model: Order, as: "orders" }
  });
  console.log(JSON.stringify(customerWithOrders, null, 2));

  console.log("\n✔ Associations successfully tested!");
})();