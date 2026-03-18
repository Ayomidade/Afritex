import User from "../models/user.model.js";

export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId, {
      attributes: [
        "userId",
        "firstName",
        "lastName",
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

    const { firstName, lastName, phoneNumber } = req.body;

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
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
        "firstName",
        "lastName",
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
    const userId = req.params;
    const user = await User.findByPk(userId, {
      attributes: [
        "userId",
        "firstName",
        "lastName",
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
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    await user.update({
      profileImage: req.file.path,
    });

    res.status(200).json({
      status: "success",
      message: "Profile image updated",
      profileImage: user.profileImage,
    });
  } catch (error) {
    next(error);
  }
};
