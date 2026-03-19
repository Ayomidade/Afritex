import Product from "../models/product.model";
import Store from "../models/store.model"

export const createProduct = async (req, res, next) => {
  try {
    const { productName, productDescription, productStatus, productPrice, stock } = req.body;
    const productImages=req.files?req.files.map(file=>file.path):[];

    const designerId=req.user.userId;

    const store=await Store.findOne({where:{designerId}})
    if (!store) {
      return res.status(400).json({message:"Create a store before adding products."})
    }

    const storeId=store.storeId


    const product = await Product.create({
      productName,
      productDescription,
      // designerId: req.user.userId,
      productStatus,
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

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();

    res
      .status(200)
      .json({ status: "Success", result: products.length, data: products });
  } catch (error) {
    next();
  }
};

export const getSingleProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByPk(productId);
    if (!product) {
      const error = new Error("Product not found.");
      error.status = 404;
      throw error;
    }

    res.status(200).json({ status: "Success", data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { price, productName, productDescription } = req.body;
    const productId = req.params.id;

    const product = await Product.findByPk(productId);
    if (!product) {
      const error = new Error("Product not found.");
      error.status = 404;
      throw error;
    }

    await product.update({ productName, productDescription });

    res.status(200).json({ status: "Success", data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByPk(productId);
    if (!product) {
      const error = new Error("Product not found.");
      error.status = 404;
      throw error;
    }

    await product.destroy();

    res.status(200).json({
      status: "success",
      message: "Product deleted",
    });
  } catch (error) {
    next(error);
  }
};

export const getDesignerProducts = async (req, res, next) => {
  try {
    const designerId = req.params.id;

    const products = await Product.findAll({
      where: { designerId },
    });

    res.status(200).json({
      status: "success",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
