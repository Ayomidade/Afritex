import { body, param, validationResult } from "express-validator";
import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import Product from "../models/product.model.js";

// ================= VALIDATION RULES =================
export const addToCartValidation = [
  body("productId")
    .notEmpty().withMessage("Product ID is required.")
    .isInt({ min: 1 }).withMessage("Product ID must be a valid number."),

  body("quantity")
    .notEmpty().withMessage("Quantity is required.")
    .isInt({ min: 1 }).withMessage("Quantity must be at least 1."),
];

export const updateCartValidation = [
  param("id")
    .isInt({ min: 1 }).withMessage("Cart item ID must be a valid number."),

  body("quantity")
    .notEmpty().withMessage("Quantity is required.")
    .isInt({ min: 1 }).withMessage("Quantity must be at least 1."),
];

/* =========================
   ADD TO CART
========================= */
export const addtoCart = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "Failed",
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        status: "Failed",
        message: "Product not found.",
      });
    }

    // check stock before adding
    if (product.stock < quantity) {
      return res.status(400).json({
        status: "Failed",
        message: `Insufficient stock. Only ${product.stock} units available.`,
      });
    }

    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    const existingItem = await CartItem.findOne({
      where: { cartId: cart.cartId, productId },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      // check stock against new total quantity
      if (product.stock < newQuantity) {
        return res.status(400).json({
          status: "Failed",
          message: `Insufficient stock. Only ${product.stock} units available.`,
        });
      }

      await existingItem.update({ quantity: newQuantity });

      return res.status(200).json({
        status: "Success",
        message: "Cart updated",
        data: existingItem,
      });
    }

    const cartItem = await CartItem.create({
      cartId: cart.cartId,
      productId,
      quantity,
    });

    return res.status(200).json({
      status: "Success",
      message: "Product added to cart",
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET MY CART
========================= */
export const getMyCart = async (req, res, next) => {
  try {
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
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(404).json({
        status: "Failed",
        message: "Cart is empty",
      });
    }

    res.status(200).json({
      status: "Success",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   UPDATE CART ITEM
========================= */
export const updateCartItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "Failed",
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const cartItemId = req.params.id;
    const { quantity } = req.body;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({
        status: "Failed",
        message: "Cart not found",
      });
    }

    const cartItem = await CartItem.findOne({
      where: { cartItemId, cartId: cart.cartId },
    });

    if (!cartItem) {
      return res.status(403).json({
        status: "Failed",
        message: "Unauthorized.",
      });
    }

    // check stock before updating
    const product = await Product.findByPk(cartItem.productId);
    if (product && product.stock < quantity) {
      return res.status(400).json({
        status: "Failed",
        message: `Insufficient stock. Only ${product.stock} units available.`,
      });
    }

    await cartItem.update({ quantity });

    res.status(200).json({
      status: "Success",
      message: "Cart item updated",
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   REMOVE CART ITEM
========================= */
export const removeCartItem = async (req, res, next) => {
  try {
    const cartItemId = req.params.id;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({
        status: "Failed",
        message: "Cart not found",
      });
    }

    const cartItem = await CartItem.findOne({
      where: { cartItemId, cartId: cart.cartId },
    });

    if (!cartItem) {
      return res.status(403).json({
        status: "Failed",
        message: "Unauthorized.",
      });
    }

    await cartItem.destroy();

    res.status(200).json({
      status: "Success",
      message: "Item removed from cart",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   CLEAR CART
========================= */
export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      return res.status(404).json({
        status: "Failed",
        message: "Cart not found.",
      });
    }

    await CartItem.destroy({ where: { cartId: cart.cartId } });

    res.status(200).json({
      status: "Success",
      message: "Cart cleared",
    });
  } catch (error) {
    next(error);
  }
};