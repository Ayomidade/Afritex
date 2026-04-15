import cloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import { getPublicIdFromUrl } from "../utils/cloudinary.utils.js";

export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId, {
      attributes: [
        "userId",
        "fullname",
        "email",
        "phoneNumber",
        "role",
        "profileImage",
        "isVerified",
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { fullname, phoneNumber } = req.body;

    await user.update({
      fullname: fullname || user.fullname,
      phoneNumber: phoneNumber || user.phoneNumber,
    });

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await user.destroy();

    res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: [
        "userId",
        "fullname",
        "email",
        "phoneNumber",
        "role",
        "profileImage",
        "isVerified",
      ],
    });

    res
      .status(200)
      .json({ status: "Success", result: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId, {
      attributes: [
        "userId",
        "fullname",
        "email",
        "phoneNumber",
        "role",
        "profileImage",
        "isVerified",
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ status: "Success", data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    
    if (user.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // delete old image if exists
    if (user.profileImage) {
      const publicId = getPublicIdFromUrl(user.profileImage);
      await cloudinary.uploader.destroy(publicId);
    }

    // save new image
    await user.update({
      profileImage: req.file.path,
    });

    res.status(200).json({
      status: "success",
      profileImage: user.profileImage,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId, {
      attributes: [
        "userId",
        "fullname",
        "role",
        "profileImage",
        "savedProducts",
        "stats",
      ],
    }); // changed: load dashboard fields for customer

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: {
        welcome: `Welcome back, ${user.fullname}!`,
        summary: {
          totalOrders: user.stats.totalOrders,
          activeOrders: user.stats.activeOrders,
          totalSales: user.stats.totalSales,
          pendingOrders: user.stats.pendingOrders,
        },
        stats: user.stats,
        savedProducts: user.savedProducts || [],
      },
    });
  } catch (error) {
    next(error);
  }
};
