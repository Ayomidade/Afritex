import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import OrderItem from "../models/order_items.model.js";
import { sendEmail, customerOrderTemplate } from "../services/email.service.js";

export const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Order must contain at least one item",
      });
    }

    let totalPrice = 0;
    const orderItems = [];

    
    for (const item of items) {
      const product = await Product.findByPk(item.productId);

      if (!product) {
        return res.status(404).json({
          status: "error",
          message: `Product with ID ${item.productId} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          status: "error",
          message: `Not enough stock for ${product.productName}`,
        });
      }

      totalPrice += product.productPrice * item.quantity;

      orderItems.push({
        product,
        productId: product.productId,
        quantity: item.quantity,
        priceAtPurchase: product.productPrice,
      });
    }

    
    const order = await Order.create({
      userId: req.user.userId,
      totalPrice,
      dateOrdered: new Date(),
      orderStatus: "pending",
    });

    const orderId = order.id;

    
    for (const item of orderItems) {
      await OrderItem.create({
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      });

      item.product.stock -= item.quantity;
      await item.product.save();
    }

    
    if (req.user.email) {
      await sendEmail({
        to: req.user.email,
        subject: "Order Confirmed - Afritex",
        html: customerOrderTemplate(
          req.user.firstName || "Customer",
          orderId
        ),
      });
    }

  
    return res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: order,
    });

  } catch (error) {
    next(error);
  }
};