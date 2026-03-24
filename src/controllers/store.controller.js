import { body, validationResult } from "express-validator";
import { Op } from "sequelize";
import Product from "../models/product.model.js";
import Store from "../models/store.model.js";

// ================= VALIDATION RULES =================
export const createStoreValidation = [
  body("storeName")
    .trim()
    .notEmpty().withMessage("Store name is required.")
    .isLength({ min: 2 }).withMessage("Store name must be at least 2 characters."),

  body("storeDescription")
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage("Store description must be at least 10 characters."),

  body("socialLinks")
    .optional()
    .isObject().withMessage("Social links must be a valid object."),
];

export const updateStoreValidation = [
  body("storeName")
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage("Store name must be at least 2 characters."),

  body("storeDescription")
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage("Store description must be at least 10 characters."),

  body("socialLinks")
    .optional()
    .isObject().withMessage("Social links must be a valid object."),
];

/* =========================
   CREATE STORE
========================= */
export const createStore = async (req, res, next) => {
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

    const designerId = req.user.userId;

    const existingStore = await Store.findOne({ where: { designerId } });
    if (existingStore) {
      return res.status(400).json({
        status: "Failed",
        message: "You already have a store.",
      });
    }

    const { storeName, storeDescription, socialLinks } = req.body;
    const storeLogo = req.files?.storeLogo?.[0]?.path || null;
    const storeBanner = req.files?.storeBanner?.[0]?.path || null;

    const store = await Store.create({
      storeName,
      storeDescription,
      socialLinks,
      storeLogo,
      storeBanner,
      designerId,
    });

    res.status(201).json({
      status: "Success",
      message: "Store created successfully.",
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET ALL STORES
========================= */
export const getAllStore = async (req, res, next) => {
  try {
    const stores = await Store.findAll({
      attributes: [
        "storeId",
        "storeName",
        "storeLogo",
        "storeBanner",
        "storeDescription",
      ],
    });

    res.status(200).json({
      status: "Success",
      results: stores.length,
      data: stores,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET STORE BY ID
========================= */
export const getStoreById = async (req, res, next) => {
  try {
    const { id } = req.params; // ✅ fixed — was storeId, route uses :id

    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({
        status: "Failed",
        message: "Store not found.",
      });
    }

    res.status(200).json({ status: "Success", data: store });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET MY STORE
========================= */
export const getMyStore = async (req, res, next) => {
  try {
    const designerId = req.user.userId;

    const store = await Store.findOne({ where: { designerId } });
    if (!store) {
      return res.status(404).json({
        status: "Failed",
        message: "You do not have a store yet.",
      });
    }

    res.status(200).json({
      status: "Success",
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   UPDATE STORE
========================= */
export const updateStore = async (req, res, next) => {
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

    const designerId = req.user.userId;

    const store = await Store.findOne({ where: { designerId } });
    if (!store) {
      return res.status(404).json({
        status: "Failed",
        message: "Store not found.",
      });
    }

    // redundant check removed — findOne already scopes to designerId
    const { storeName, storeDescription, socialLinks } = req.body;
    const storeLogo = req.files?.storeLogo?.[0]?.path || store.storeLogo;
    const storeBanner = req.files?.storeBanner?.[0]?.path || store.storeBanner;

    await store.update({
      storeName: storeName || store.storeName,
      storeDescription: storeDescription || store.storeDescription,
      socialLinks: socialLinks || store.socialLinks,
      storeLogo,
      storeBanner,
    });

    res.status(200).json({
      status: "Success",
      message: "Store updated successfully.",
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   DELETE STORE
========================= */
export const deleteStore = async (req, res, next) => {
  try {
    const designerId = req.user.userId;
    const storeId = req.params.id;

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({
        status: "Failed",
        message: "Store not found.",
      });
    }

    if (store.designerId !== designerId) {
      return res.status(403).json({
        status: "Failed",
        message: "Unauthorized.",
      });
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
   GET STORE PRODUCTS
   Supports search, filter, sort, pagination
========================= */
export const getStoreProducts = async (req, res, next) => {
  try {
    const { id: storeId } = req.params;
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

    const where = { storeId };

    if (search) {
      where.productName = { [Op.like]: `%${search}%` };
    }

    if (category) {
      where.category = { [Op.like]: `%${category}%` };
    }

    if (minPrice || maxPrice) {
      where.productPrice = {};
      if (minPrice) where.productPrice[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.productPrice[Op.lte] = parseFloat(maxPrice);
    }

    const validSortFields = ["productPrice", "productName", "createdAt", "stock"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const pageNumber = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const offset = (pageNumber - 1) * pageSize;

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order: [[sortField, sortOrder]],
      limit: pageSize,
      offset,
    });

    res.status(200).json({
      status: "Success",
      result: products.length,
      total: count,
      page: pageNumber,
      totalPages: Math.ceil(count / pageSize),
      data: products,
    });
  } catch (error) {
    next(error);
  }
};