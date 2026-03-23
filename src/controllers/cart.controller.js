import Cart from "../models/cart.model.js";
import CartItem from "../models/CartItem.model.js";
import Product from "../models/product.model.js";

export const addtoCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    const product = Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    let cart = await Cart.findOne({
      where: { userId },
    });

    if (!cart) {
      cart = await Cart.create({ userId });
    }

    const existingItem = await CartItem.findOne({
      where: { cartId: cart.cartId, productId },
    });

    if (existingItem) {
      await existingItem.update({ quantity: existingItem.quantity + quantity });

      return res
        .status(200)
        .json({ message: "Cart updated", data: existingItem });
    }

    const cartItem = await CartItem.create({
      cartId: cart.cartId,
      productId,
      quantity,
    });

    res.status(200).json({
      status: "Success",
      message: "Product added to cart",
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({
      where: { userId },
      include: {
        model: CartItem,
        include: Product,
      },
    });
    if (!cart) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    res.status(200).json({ status: "Success", data: cart });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const cartItemId = req.params.id;
    const { quantity } = req.body;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ where: { userId } });

    const cartItem = await CartItem.findOne({
      where: {
        cartItemId,
        cartId: cart.cartId,
      },
    });
    if (!cartItem) {
      return res.status(403).json({ message: "Unauthorized." });
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

export const removeCartItem = async (req, res, next) => {
  try {
    const cartItemId = req.params.id;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ where: { userId } });
    const cartItem = await CartItem.findOne({
      where: {
        cartItemId,
        cartId: cart.cartId,
      },
    });
    if (!cartItem) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    await cartItem.destroy();

    res
      .status(200)
      .json({ status: "Success", message: "Item removed from cart" });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({
      where: { userId },
    });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    await CartItem.destroy({ where: { cartId: cart.cartId } });

    res.status(200).json({ status: "Success", message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
};
