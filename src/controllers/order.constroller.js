import { model } from "mongoose";
import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";
import Product from "../models/product.model.js";

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({
      where: { userId },
      include: {
        model: CartItem,
        as: "items",
        include: Product,
      },
    });

    if (!cart || cart.CartItems.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    let totalAmount = 0;

    cart.CartItems.forEach((item) => {
      totalAmount += item.quantity * item.Product.price;
    });

    const order = await Order.create({
      userId,
      totalAmount,
    });

    const orderItems = cart.CartItems.map((item) => ({
      orderId: order.orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.Product.price,
      status: "pending",
    }));

    await OrderItem.bulkCreate(orderItems);

    await CartItem.destroy({
      where: { cartId: cart.cartId },
    });

    res.status(201).json({
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.findAll({
      where: { userId },
      include: {
        model: OrderItem,
        as: "items",
        include: { model: Product, as: "product" },
      },
    });

    res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;

    const order = await Order.findOne({
      where: { orderId, userId },
      include: OrderItem,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderItemStatus = async (req, res, next) => {
  try {
    const designerId = req.user.userId;
    const orderItemId = req.params.id;
    const { status } = req.body;

    const orderItem = await OrderItem.findByPk(orderItemId, {
      include: {
        model: Product,
        as: "product",
      },
    });

    if (!orderItemId) {
      return res.status(404).json({ message: "Order item not found" });
    }

    if (orderItem.product.designerId !== designerId) {
      return res.status(403).json({ message: "You can't update this order" });
    }

    await orderItem.update({ status });

    res.status(200).json({ message: "Order item status updated." });
  } catch (error) {
    next(error);
  }
};
