import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import User from "../models/user.model.js";

// ================= REGISTER USER =================
export const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, role, email, password, phoneNumber } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phoneNumber ||
      !role
    ) {
      const error = new Error("All fields are required.");
      error.statusCode = 400;
      throw error;
    }

    // CHECK FOR EXISTING USER
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      const error = new Error("User already exists.");
      error.statusCode = 409;
      throw error;
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const profileImage = req.file ? req.file.path : null;

    // CREATE USER
    const newUser = await User.create({
      firstName,
      lastName,
      role,
      email,
      password: hashedPassword,
      phoneNumber,
      profileImage,
    });

    // ✅ CONSISTENT TOKEN STRUCTURE (VERY IMPORTANT)
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
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("All fields are required.");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      const error = new Error("User doesn't exist.");
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid credentials.",
      });
    }

    // ✅ CONSISTENT TOKEN STRUCTURE
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
    // ✅ FIXED (userId instead of id)
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
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};