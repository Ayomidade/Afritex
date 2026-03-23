import User from "../models/user.model.js";
import Store from "../models/store.model.js";
import Product from "../models/product.model.js";

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

export const getAllDesigners = async (req, res, next) => {
  try {
    const designers = await User.findAll({ where: { role: "designer" } });
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
    const designer = await User.findByPk({ designerId });

    if (!designer || designer.role !== "designer") {
      return res.status(404).json({ message: "Designer not found." });
    }

    await designer.update({ isVerified: true });

    res
      .status(200)
      .json({ status: "Success", message: "Designer verified successfully" });
  } catch (error) {
    next(error);
  }
};

export const getAllStores = async (req, res, next) => {
  try {
    const stores = await Store.findAll();
    res
      .status(200)
      .json({ status: "Success", result: stores.length, data: stores });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();

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
    const product = Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    await product.destroy();

    res
      .status(200)
      .json({ status: "Succcess", message: "Product removed by admin" });
  } catch (error) {
    next(error);
  }
};

export const deleteStore = async (req, res, next) => {
  try {
    const storeId = req.params.id;
    const store = Store.findByPk(storeId);

    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    await store.destroy();

    res
      .status(200)
      .json({ status: "Success", message: "Store deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await user.destroy();

    res
      .status(200)
      .json({
        status: "Success",
        message: "User account deleted successfully.",
      });
  } catch (error) {
    next(error);
  }
};
