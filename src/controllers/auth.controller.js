import crypto from "crypto";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import { Op } from "sequelize";
import { body, validationResult } from "express-validator";
import User from "../models/user.model.js";
import { sendEmail, passwordResetTemplate } from "../services/email.service.js";
import { tokenBlacklist } from "../utils/tokenBlacklist.js";

// ================= VALIDATION RULES =================
export const registerValidation = [
  body("firstName")
    .trim()
    .notEmpty().withMessage("First name is required.")
    .isLength({ min: 2 }).withMessage("First name must be at least 2 characters."),

  body("lastName")
    .trim()
    .notEmpty().withMessage("Last name is required.")
    .isLength({ min: 2 }).withMessage("Last name must be at least 2 characters."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address."),

  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters.")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/).withMessage("Password must contain at least one number."),

  body("phoneNumber")
    .trim()
    .notEmpty().withMessage("Phone number is required.")
    .isMobilePhone().withMessage("Please provide a valid phone number."),

  body("role")
    .trim()
    .notEmpty().withMessage("Role is required.")
    .isIn(["customer", "designer"]).withMessage("Role must be either customer or designer."),
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address."),

  body("password")
    .notEmpty().withMessage("Password is required."),
];

export const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address."),
];

export const resetPasswordValidation = [
  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters.")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/).withMessage("Password must contain at least one number."),
];

// ================= REGISTER USER =================
export const registerUser = async (req, res, next) => {
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

    const { firstName, lastName, role, email, password, phoneNumber } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        status: "Failed",
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileImage = req.file ? req.file.path : null;

    const newUser = await User.create({
      firstName,
      lastName,
      role,
      email,
      password: hashedPassword,
      phoneNumber,
      profileImage,
    });

    const token = JWT.sign(
      {
        userId: newUser.userId,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.status(201).json({
      status: "Success",
      message: "User registered successfully",
      data: {
        user: {
          userId: newUser.userId,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          profileImage,
        },
      },
      token,
    });
  } catch (error) {
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
      { expiresIn: "2d" }
    );

    res.status(200).json({
      status: "Success",
      message: "Login successful.",
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
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
        "firstName",
        "lastName",
        "email",
        "role",
        "phoneNumber",
        "profileImage",
        "isVerified",
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
      html: passwordResetTemplate(user.firstName, resetUrl),
    });

    res.status(200).json({
      status: "Success",
      message: "If this email exists, a reset link has been sent.",
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
    const token = authHeader.split(" ")[1];

    tokenBlacklist.add(token);

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