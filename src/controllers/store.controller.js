import Product from "../models/product.model.js";
import Store from "../models/store.model.js";
import dotenv from "dotenv";


export const createStore = async (req, res, next) => {
  try {
    const designerId = req.user.userId;
  
    const existingStore = await Store.findOne({ where: { designerId } });
    if (existingStore) {
      return res.status(400).json({ message: "Designer already has a store." });
    }

    const { storeName, storeDescription, socialLinks } = req.body;
    const storeLogo = req.files?.storeLogo?.[0]?.path || null;
    const storeBanner = req.filees?.storeBanner?.[0]?.path || null;

    const store = await Store.create({
      storeName,
      storeDescription,
      socialLinks,
      storeLogo,
      storeBanner,
      designerId,
  });

    res.status(201).json({ status: "Success", data: store });
}catch (error) {
    next(error);
  }}



export const getStoreById = async (req, res, next) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findByPk(storeId);

    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    res.status(200).json({ status: "Success", data: store });
  } catch (error) {
    next(error);
  }
};

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

    res
      .status(200)
      .json({ status: "Success", results: stores.length, data: stores });
  } catch (error) {
    next(error);
  }
};

export const getMyStore = async (req, res, next) => {
  try {
    const designerId = req.user.userId;

    const store = await Store.findOne({ where: { designerId } });

    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    res.status(200).json({
      status: "Success",
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStore = async (req, res, next) => {
  try {
    const designerId = req.user.userId;
    const store = await Store.findOne({ where: { designerId } });
    if (!store) {
      return res.status(404).json({ messasge: "Store not found." });
    }

    if (store.designerId !== designerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }``

    const { storeName, storeDescription, socialLinks } = req.body;
    const storeLogo = req.files?.storeLogo?.[0]?.path || null;
    const storeBanner = req.filees?.storeBanner?.[0]?.path || null;

    await store.update({
      storeName: storeName || store.storeName,
      storeDescription: storeDescription || store.storeDescription,
      socialLinks: socialLinks || store.socialLinks,
      storeLogo: storeLogo || store.storeLogo,
      storeBanner: storeBanner || store.storeBanner,
    });

    res.status(200).json({ status: "Success", data: store });
  } catch (error) {
    next(error);
  }
};

export const deleteStore = async (req, res, next) => {
  try {
    const designerId = req.user.userId;
    const storeId = req.params.id;
    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ messasge: "Store not found." });
    }

    if (store.designerId !== designerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await store.destroy();

    res.status(200).send({ message: "Store deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const getStoreProducts = async (req, res, next) => {
  try {
    const storeId = req.params.storeId;

    const products = await Product.findAll({ where: storeId });
    res
      .status(200)
      .json({ status: "Success", results: products.length, data: products });
  } catch (error) {
    next(error);
  }
};