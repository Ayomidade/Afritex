import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import User from "../models/user.model";
import sequelize from "../MySql/config/db";

export const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, role, email, password, phoneNumber } =
      req.body;
    if (!firstName || !lastName || !email || !password || phoneNumber) {
      const error = new Error("All fields are required.");
      error.statusCode = 400;
      throw error;
    }

    // CHECK FOR EXISTING USER
    const [existingUser] = await User.findOne({ where: { email } });

    if (existingUser) {
      const error = new Error("User already exists.");
      error.statusCode(409);
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = User.create({
      firstName,
      lastName,
      role: role || "customer",
      email,
      password: hashedPassword,
      phoneNumber,
    });

    const token = JWT.sign(
      { id: newUser.userId, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" },
    );

    res.status(201).json({
      status: "Success",
      message: "User registered successfully",
      data: {
        user: {
          id: newUser.userId,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
        },
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

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
      const error = new Error("User doesn't exists.");
      error.statusCode(401);
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "Error", message: "Invalid credentials." });
    }

    const token = JWT.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" },
    );

    res.status(200).json({
      status: "Success",
      message: "Login successful.",
      data: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attribute: [
        "userId",
        "firstName",
        "lastName",
        "email",
        "role",
        "phoneNumber",
      ],
    });

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode(404);
      throw error;
    }

    return res.status(200).json({ status: "Success", data: user });
  } catch (error) {
    next(error);
  }
};
