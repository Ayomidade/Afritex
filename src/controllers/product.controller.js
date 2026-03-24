import { Op } from "sequelize";
import { body, validationResult } from "express-validator";
import Product from "../models/product.model.js";
import Store from "../models/store.model.js";

// ================= VALIDATION RULES =================
export const createProductValidation = [
  body("productName")
    .trim()
    .notEmpty().withMessage("Product name is required.")
    .isLength({ min: 2 }).withMessage("Product name must be at least 2 characters."),

  body("productDescription")
    .trim()
    .notEmpty().withMessage("Product description is required.")
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters."),

  body("productPrice")
    .notEmpty().withMessage("Product price is required.")
    .isFloat({ min: 0.01 }).withMessage("Price must be a valid number greater than 0."),

  body("stock")
    .optional()
    .isInt({ min: 0 }).withMessage("Stock must be a valid non-negative number."),

  body("category")
    .optional()
    .trim()
    .notEmpty().withMessage("Category cannot be empty if provided."),
];

export const updateProductValidation = [
  body("productName")
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage("Product name must be at least 2 characters."),

  body("productDescription")
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters."),

  body("productPrice")
    .optional()
    .isFloat({ min: 0.01 }).withMessage("Price must be a valid number greater than 0."),

  body("stock")
    .optional()
    .isInt({ min: 0 }).withMessage("Stock must be a valid non-negative number."),

  body("category")
    .optional()
    .trim()
    .notEmpty().withMessage("Category cannot be empty if provided."),
];

/* =========================
   GET ALL PRODUCTS
   Supports:
   - search by name (?search=shirt)
   - filter by category (?category=fashion)
   - filter by price range (?minPrice=100&maxPrice=5000)
   - sort (?sortBy=productPrice&order=asc)
   - pagination (?page=1&limit=10)
========================= */
export const getAllProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy,
      order,
      page,
      limit,
    } = req.query;

    const where = {};

    // search by product name
    if (search) {
      where.productName = { [Op.like]: `%${search}%` };
    }

    // filter by category
    if (category) {
      where.category = { [Op.like]: `%${category}%` };
    }

    // filter by price range
    if (minPrice || maxPrice) {
      where.productPrice = {};
      if (minPrice) where.productPrice[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.productPrice[Op.lte] = parseFloat(maxPrice);
    }

    // sorting — only allow valid columns to prevent injection
    const validSortFields = ["productPrice", "productName", "createdAt", "stock"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // pagination
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const offset = (pageNumber - 1) * pageSize;

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order: [[sortField, sortOrder]],
      limit: pageSize,
      offset,
    });

    const totalPages = Math.ceil(count / pageSize);

    res.status(200).json({
      status: "Success",
      result: products.length,
      total: count,
      page: pageNumber,
      totalPages,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   CREATE PRODUCT
========================= */
export const createProduct = async (req, res, next) => {
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

    const { productName, productDescription, category, productPrice, stock } =
      req.body;
    const productImages = req.files ? req.files.map((file) => file.path) : [];

    const designerId = req.user.userId;

    const store = await Store.findOne({ where: { designerId } });
    if (!store) {
      return res.status(400).json({
        status: "Failed",
        message: "Create a store before adding products.",
      });
    }

    const product = await Product.create({
      productName,
      productDescription,
      productPrice,
      category,
      productImages,
      stock,
      storeId: store.storeId,
    });

    res.status(201).json({
      status: "Success",
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET SINGLE PRODUCT
========================= */
export const getSingleProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        status: "Failed",
        message: "Product not found.",
      });
    }

    res.status(200).json({ status: "Success", data: product });
  } catch (error) {
    next(error);
  }
};

/* =========================
   UPDATE PRODUCT
========================= */
export const updateProduct = async (req, res, next) => {
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

    const { productName, productDescription, stock, category, productPrice } =
      req.body;
    const designerId = req.user.userId;
    const productId = req.params.id;

    const store = await Store.findOne({ where: { designerId } });
    if (!store) {
      return res.status(404).json({
        status: "Failed",
        message: "Store not found.",
      });
    }

    const product = await Product.findByPk(productId);
    if (!product || product.storeId !== store.storeId) {
      return res.status(404).json({
        status: "Failed",
        message: "Product not found.",
      });
    }

    await product.update({
      productName: productName || product.productName,
      productDescription: productDescription || product.productDescription,
      productPrice: productPrice || product.productPrice,
      category: category || product.category,
      stock: stock !== undefined ? stock : product.stock,
    });

    res.status(200).json({ status: "Success", data: product });
  } catch (error) {
    next(error);
  }
};

/* =========================
   DELETE PRODUCT
========================= */
export const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const designerId = req.user.userId;

    const store = await Store.findOne({ where: { designerId } });
    if (!store) {
      return res.status(404).json({
        status: "Failed",
        message: "Store not found.",
      });
    }

    const product = await Product.findByPk(productId);
    if (!product || store.storeId !== product.storeId) {
      return res.status(404).json({
        status: "Failed",
        message: "Product not found.",
      });
    }

    await product.destroy();

    res.status(200).json({
      status: "Success",
      message: "Product deleted",
    });
  } catch (error) {
    next(error);
  }
};
