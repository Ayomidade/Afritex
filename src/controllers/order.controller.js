import { body, validationResult } from "express-validator";
import sequelize from "../MySql/config/db.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/order_items.model.js";
import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import { sendEmail, customerOrderTemplate } from "../services/email.service.js";

// ================= VALIDATION RULES =================
export const createOrderValidation = [
  body("shippingAddress")
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage("Shipping address must be at least 5 characters."),
];

/* =========================
   CREATE ORDER
========================= */
export const createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        status: "Failed",
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const userId = req.user.userId;

    const cart = await Cart.findOne({
      where: { userId },
      include: {
        model: CartItem,
        as: "items",
        include: {
          model: Product,
          as: "product",
        },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!cart) {
      await transaction.rollback();
      return res.status(400).json({
        status: "Failed",
        message: "No cart found for this user",
      });
    }

    if (!cart.items || cart.items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        status: "Failed",
        message: "Cart is empty",
      });
    }

    // check stock availability before creating order
    for (const item of cart.items) {
      if (!item.product) {
        await transaction.rollback();
        return res.status(400).json({
          status: "Failed",
          message: `Product not found for cartItem ${item.cartItemId}`,
        });
      }
      if (item.product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          status: "Failed",
          message: `Insufficient stock for "${item.product.productName}". Available: ${item.product.stock}`,
        });
      }
    }

    let totalAmount = 0;
    cart.items.forEach((item) => {
      totalAmount += item.quantity * item.product.productPrice;
    });

    const order = await Order.create(
      {
        userId,
        totalAmount,
        dateOrdered: new Date(),
        orderStatus: "pending",
      },
      { transaction }
    );

    const orderItems = cart.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.productPrice,
      orderStatus: "pending",
    }));

    await OrderItem.bulkCreate(orderItems, { transaction });

    // decrement stock for each product
    for (const item of cart.items) {
      await Product.update(
        { stock: item.product.stock - item.quantity },
        { where: { productId: item.productId }, transaction }
      );
    }

    await CartItem.destroy({
      where: { cartId: cart.cartId },
      transaction,
    });

    await transaction.commit();

    if (req.user.email) {
      await sendEmail({
        to: req.user.email,
        subject: "Order Confirmed - Afritex",
        html: customerOrderTemplate(
          req.user.firstName || "Customer",
          order.id
        ),
      });
    }

    return res.status(201).json({
      status: "Success",
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/* =========================
   GET MY ORDERS
========================= */
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.findAll({
      where: { userId },
      include: {
        model: OrderItem,
        as: "items",
        include: {
          model: Product,
          as: "product",
        },
      },
      order: [["createdAt", "DESC"]],
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        status: "Failed",
        message: "No orders found",
      });
    }

    res.status(200).json({
      status: "Success",
      result: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET SINGLE ORDER
========================= */
export const getSingleOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.userId;

    const order = await Order.findOne({
      where: { id: orderId, userId },
      include: {
        model: OrderItem,
        as: "items",
        include: {
          model: Product,
          as: "product",
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        status: "Failed",
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: "Success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};