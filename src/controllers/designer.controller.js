import Designer from "../models/designer.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

export const getDesignerProfile = async (req, res, next) => {
  try {
    const designer = await User.findOne({
      where: { userId: req.user.userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "userId",
            "fullname",
            "email",
            "phoneNumber",
            "country",
            "profileImage",
            "bio",
            "address",
          ],
        },
      ],
    });

    if (!designer) {
      return res.status(404).json({
        status: "Failed",
        message: "Designer profile not found.",
      });
    }

    return res.status(200).json({
      status: "Success",
      data: {
        profile: {
          userId: designer.userId,
          fullname: designer.user.fullname,
          email: designer.user.email,
          phoneNumber: designer.user.phoneNumber,
          country: designer.user.country,
          profileImage: designer.user.profileImage,
          bio: designer.user.bio,
          address: designer.user.address,
          brandName: designer.brandName,
          location: designer.location,
          portfolio: designer.portfolio,
          rating: designer.rating,
          socialLinks: designer.socialLinks,
        },
        stats: designer.stats,
        products: designer.products || [],
        orderHistory: designer.orderHistory || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDesignerDashboard = async (req, res, next) => {
  try {
    const designer = await User.findOne({
      where: { userId: req.user.userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["fullname", "profileImage"],
        },
      ],
    });

    if (!designer) {
      return res.status(404).json({
        status: "Failed",
        message: "Designer dashboard not found.",
      });
    }

    return res.status(200).json({
      status: "Success",
      data: {
        welcome: `Welcome back, ${designer.user.fullname}!`,
        summary: {
          totalProducts: designer.stats.totalProducts,
          totalOrders: designer.stats.totalOrders,
          totalSales: designer.stats.totalSales,
          pendingOrders: designer.stats.activeOrders,
        },
        stats: designer.stats,
        recentOrders: designer.orderHistory || [],
        managedProducts: designer.products || [],
      },
    });
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
        "fullname",
        "profileImage",
        "isVerified",
        "createdAt",
      ],
    }); // changed: use fullname instead of firstName/lastname

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
    const {
      fullname,
      phoneNumber,
      country,
      bio,
      address,
      brandName,
      location,
      portfolio,
      socialLinks,
    } = req.body; // changed: accept designer profile fields
    const profileImage = req.file ? req.file.path : undefined;

    const user = await User.findByPk(req.user.userId);
    if (!user || user.role !== "designer") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const designer = await User.findOne({ where: { userId: user.userId } });
    if (!designer) {
      return res.status(404).json({
        message: "Designer profile not found.",
      });
    }

    await user.update({
      fullname: fullname || user.fullname,
      phoneNumber: phoneNumber || user.phoneNumber,
      country: country || user.country,
      bio: bio !== undefined ? bio : user.bio,
      address: address !== undefined ? address : user.address,
      profileImage: profileImage || user.profileImage,
    }); // changed: update base user info

    await designer.update({
      brandName: brandName || designer.brandName,
      location: location || designer.location,
      portfolio: portfolio || designer.portfolio,
      socialLinks:
        socialLinks !== undefined ? socialLinks : designer.socialLinks,
    }); // changed: update designer-specific info

    return res.status(200).json({
      status: "success",
      data: {
        user,
        designer,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyDesigner = async (req, res, next) => {
  try {
    const { designerId } = req.params;
    const designer = await User.findByPk(designerId); // changed: await Designer record lookup

    if (!designer) {
      return res.status(404).json({ message: "Designer not found." });
    }

    await designer.update({ isVerified: true });

    res.status(200).json({
      status: "Success",
      message: "Designer has been verified successfully.",
      data: designer,
    });
  } catch (error) {
    next(error);
  }
};
