import { Op } from "sequelize";
import User from "../models/user.model.js";
import Store from "../models/store.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/order_items.model.js";
import { sendEmail, designerVerificationTemplate } from "../services/email.service.js";

/* =========================
   DASHBOARD STATS
========================= */
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count({ where: { role: "customer" } });
    const totalDesigners = await User.count({ where: { role: "designer" } });
    const totalStores = await Store.count();
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();

    const revenueResult = await Order.sum("totalAmount", {
      where: { orderStatus: "delivered" },
    });
    const totalRevenue = revenueResult || 0;

    const pendingOrders = await Order.count({
      where: { orderStatus: "pending" },
    });

    const unverifiedDesigners = await User.count({
      where: { role: "designer", isVerified: false },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
    });

    const recentOrders = await Order.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: {
        model: User,
        as: "customer",
        attributes: ["firstName", "lastName", "email"],
      },
    });

    return res.status(200).json({
      status: "Success",
      data: {
        totalUsers,
        totalDesigners,
        totalStores,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        unverifiedDesigners,
        newUsersLast30Days: newUsers,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   USER MANAGEMENT
========================= */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: [
        "userId",
        "firstName",
        "lastName",
        "email",
        "role",
        "isVerified",
        "createdAt",
      ],
    });

    res
      .status(200)
      .json({ status: "Success", result: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await user.destroy();

    res.status(200).json({
      status: "Success",
      message: "User account deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   CUSTOMER MANAGEMENT
========================= */
export const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await User.findAll({
      where: { role: "customer" },
      attributes: [
        "userId",
        "firstName",
        "lastName",
        "email",
        "phoneNumber",
        "isVerified",
        "createdAt",
      ],
      include: {
        model: Order,
        as: "orders",
        attributes: ["id", "totalAmount", "orderStatus", "createdAt"],
      },
    });

    const data = customers.map((customer) => {
      const plain = customer.toJSON();
      plain.totalOrders = plain.orders.length;
      plain.totalSpent = plain.orders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );
      return plain;
    });

    res.status(200).json({
      status: "Success",
      result: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleCustomer = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const customer = await User.findOne({
      where: { userId, role: "customer" },
      attributes: [
        "userId",
        "firstName",
        "lastName",
        "email",
        "phoneNumber",
        "profileImage",
        "createdAt",
      ],
      include: {
        model: Order,
        as: "orders",
        include: {
          model: OrderItem,
          as: "items",
          include: {
            model: Product,
            as: "product",
            attributes: ["productId", "productName", "productPrice"],
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const data = customer.toJSON();
    data.totalOrders = data.orders.length;
    data.totalSpent = data.orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

    res.status(200).json({
      status: "Success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   DESIGNER MANAGEMENT
========================= */
export const getAllDesigners = async (req, res, next) => {
  try {
    const designers = await User.findAll({
      where: { role: "designer" },
      attributes: [
        "userId",
        "firstName",
        "lastName",
        "email",
        "isVerified",
        "createdAt",
      ],
      include: {
        model: Store,
        as: "store",
        attributes: ["storeId", "storeName"],
      },
    });

    res
      .status(200)
      .json({ status: "Success", result: designers.length, data: designers });
  } catch (error) {
    next(error);
  }
};

export const verifyDesigners = async (req, res, next) => {
  try {
    const designerId = req.params.id;

    const designer = await User.findByPk(designerId);

    if (!designer || designer.role !== "designer") {
      return res.status(404).json({ message: "Designer not found." });
    }

    if (designer.isVerified) {
      return res
        .status(400)
        .json({ message: "Designer is already verified." });
    }

    await designer.update({ isVerified: true });

    sendEmail({
      to: designer.email,
      subject: "Designer Verification Successful",
      html: designerVerificationTemplate(designer.firstName),
    });

    res.status(200).json({
      status: "Success",
      message: "Designer verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   STORE MANAGEMENT
========================= */
export const getAllStores = async (req, res, next) => {
  try {
    const stores = await Store.findAll({
      include: {
        model: User,
        as: "owner",
        attributes: ["userId", "firstName", "lastName", "email"],
      },
    });

    res
      .status(200)
      .json({ status: "Success", result: stores.length, data: stores });
  } catch (error) {
    next(error);
  }
};

export const deleteStore = async (req, res, next) => {
  try {
    const storeId = req.params.id;

    const store = await Store.findByPk(storeId);

    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    await store.destroy();

    res.status(200).json({
      status: "Success",
      message: "Store deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   PRODUCT MANAGEMENT
========================= */
export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: {
        model: Store,
        as: "store",
        attributes: ["storeId", "storeName"],
      },
    });

    res
      .status(200)
      .json({ status: "Success", results: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    await product.destroy();

    res.status(200).json({
      status: "Success",
      message: "Product removed by admin",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   ORDER MANAGEMENT
========================= */
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["userId", "firstName", "lastName", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          include: {
            model: Product,
            as: "product",
            attributes: ["productId", "productName", "productPrice"],
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "Success",
      result: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { orderStatus } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    await order.update({ orderStatus });

    res.status(200).json({
      status: "Success",
      message: `Order status updated to ${orderStatus}`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};