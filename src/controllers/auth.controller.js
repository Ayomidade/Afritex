import crypto from "crypto";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import { Op } from "sequelize";
import { body, validationResult } from "express-validator";
import User from "../models/user.model.js";
import { sendEmail, passwordResetTemplate } from "../services/email.service.js";
import { tokenBlacklist } from "../utils/tokenBlacklist.js";
import cloudinary from "../config/cloudinary.js";

// ================= VALIDATION RULES =================
export const registerValidation = [
  body("fullname")
    .trim()
    .notEmpty()
    .withMessage("Full name is required.")
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address."),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number."),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required.")
    .isMobilePhone()
    .withMessage("Please provide a valid phone number."),

  body("country").trim().notEmpty().withMessage("Country is required."),
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address."),

  body("password").notEmpty().withMessage("Password is required."),
];

export const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address."),
];

export const resetPasswordValidation = [
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number."),
];

// ================= REGISTER CUSTOMER =================
export const registerCustomer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there's a file uploaded, delete it from Cloudinary
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(400).json({
        status: "Failed",
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const { fullname, email, password, phoneNumber, country } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      // If there's a file uploaded, delete it from Cloudinary
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(409).json({
        status: "Failed",
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Get profile image URL if uploaded
    const profileImage = req.file ? req.file.path : null;

    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "customer",
      country,
      profileImage,
      isVerified: false,
    });

    const token = JWT.sign(
      {
        userId: newUser.userId,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" },
    );

    res.status(201).json({
      status: "Success",
      message: "Customer registered successfully",
      data: {
        user: {
          userId: newUser.userId,
          fullname: newUser.fullname,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          role: newUser.role,
          country: newUser.country,
          profileImage: newUser.profileImage,
        },
      },
      token,
    });
  } catch (error) {
    // Clean up uploaded file if there's an error
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    next(error);
  }
};

// ================= REGISTER DESIGNER =================
export const registerDesigner = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(400).json({
        status: "Failed",
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    const { fullname, email, password, phoneNumber, country } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(409).json({
        status: "Failed",
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImage = req.file ? req.file.path : null;

    // Create designer user
    const designer = await User.create({
      fullname,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "designer",
      country,
      profileImage,
      isVerified: false,
    });

    const token = JWT.sign(
      {
        userId: designer.userId,
        email: designer.email,
        role: designer.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" },
    );

    res.status(201).json({
      status: "Success",
      message: "Designer account created successfully. Pending admin approval.",
      data: {
        user: {
          userId: designer.userId,
          fullname: designer.fullname,
          email: designer.email,
          phoneNumber: designer.phoneNumber,
          role: designer.role,
          country: designer.country,
          profileImage: designer.profileImage,
        },
      },
      token,
    });
  } catch (error) {
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    next(error);
  }
};

// ================= LOGIN USER =================
export const loginUser = async (req, res, next) => {
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

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: "Failed",
        message: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "Failed",
        message: "Invalid credentials.",
      });
    }

    const token = JWT.sign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" },
    );

    res.status(200).json({
      status: "Success",
      message: "Login successful.",
      data: {
        userId: user.userId,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        country: user.country,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// ================= GET CURRENT USER =================
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: [
        "userId",
        "fullname",
        "email",
        "role",
        "phoneNumber",
        "country",
        "profileImage",
        "isVerified",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: "User not found.",
      });
    }

    return res.status(200).json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ================= UPDATE USER PROFILE =================
export const updateProfile = async (req, res, next) => {
  try {
    const { fullname, phoneNumber, country } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(404).json({
        status: "Failed",
        message: "User not found.",
      });
    }

    const updateData = {};
    if (fullname) updateData.fullname = fullname;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (country) updateData.country = country;

    // Handle profile image update
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (user.profileImage) {
        const publicId = user.profileImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`afritex/users/${publicId}`);
      }
      updateData.profileImage = req.file.path;
    }

    await user.update(updateData);

    res.status(200).json({
      status: "Success",
      message: "Profile updated successfully",
      data: {
        userId: user.userId,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        country: user.country,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    next(error);
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res, next) => {
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

    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json({
        status: "Success",
        message: "If this email exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await user.update({ resetToken, resetTokenExpiry });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Afritex Password Reset",
      html: passwordResetTemplate(user.fullname, resetUrl),
    });

    res.status(200).json({
      status: "Success",
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    next(error);
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res, next) => {
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

    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        status: "Failed",
        message: "Reset link is invalid or has expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    res.status(200).json({
      status: "Success",
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

// ================= LOGOUT =================
export const logoutUser = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      tokenBlacklist.add(token);
    }

    res.status(200).json({
      status: "Success",
      message: "Logged out successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Logout failed.",
    });
  }
};

// ================= CREATE ADMIN (One-time setup) =================
export const createAdmin = async (req, res, next) => {
  try {
    const { fullname, email, password, phoneNumber, country } = req.body;

    if (!fullname || !email || !password || !phoneNumber || !country) {
      return res.status(400).json({
        status: "Failed",
        message: "All fields are required.",
      });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      return res.status(409).json({
        status: "Failed",
        message: "An admin account already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      fullname,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "admin",
      country,
      isVerified: true,
    });

    const token = JWT.sign(
      {
        userId: admin.userId,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" },
    );

    res.status(201).json({
      status: "Success",
      message: "Admin registered successfully",
      data: {
        admin: {
          adminId: admin.userId,
          fullname: admin.fullname,
          email: admin.email,
          phoneNumber: admin.phoneNumber,
          country: admin.country,
        },
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
