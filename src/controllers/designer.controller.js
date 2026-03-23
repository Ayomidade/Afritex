import User from "../models/user.model.js";
import Product from "../models/product.model.js";

export const getDesignerProfile = async (req, res, next) => {
  try {
    const { designerId } = req.params;
    const designer = await User.findOne({
      where: {
        userId: designerId,
        role: "designer",
      },
      attributes: [
        "userId",
        "firstName",
        "lastName",
        "profileImage",
        "isVerified",
        "createdAt",
      ],
    });

    if (!designer) {
      return res.status(404).json({ message: "Designer not found." });
    }

    res.status(200).json({ status: "Success", data: designer });
  } catch (error) {
    next(error);
  }
};

export const getAllDesigners = async (req, res, next) => {
  try {
    const designers = await User.findAll({
      where: { role: "designer" },
      attributes: [
        "userId",
        "firstName",
        "lastname",
        "profileImage",
        "isVerified",
        "createdAt",
      ],
    });

    res
      .status(200)
      .json({ status: "Success", result: designers.length, data: designers });
  } catch (error) {
    next(error);
  }
};

export const getDesignerProducts = async (req, res, next) => {
  try {
    const { designerId } = req.params;
    const designerProducts = await Product.findAll({
      where: { designerId: designerId },
    });

    res.status(200).json({
      status: "Success",
      result: designerProducts.length,
      data: designerProducts,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDesignerProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.user.userId;

    const user = await User.findByPk(userId);

    // Replace with the isAuthorized middleware
    if (!user || user.role !== "designer") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
    });

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Temporary
export const verifyDesigner = async (req, res, next) => {
  try {
    const { designerId } = req.params;
    const designer = User.findOne({
      where: { designerId: designerId, role: "designer" },
    });

    if (!designer) {
      return res.status(404).json({ message: "Designer not found." });
    }

    await designer.update({ isVerified: true });

    res
      .status(200)
      .json({
        status: "Success",
        message: "Designer has been verified successfully.",
        data: designer,
      });
  } catch (error) {
    next(error);
  }
};
