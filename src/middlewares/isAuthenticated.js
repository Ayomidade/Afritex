import jwt from "jsonwebtoken";
import { tokenBlacklist } from "../utils/tokenBlacklist.js";

const isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "Error",
        message: "No token found.",
      });
    }

    const token = authHeader.split(" ")[1];

    // check if token has been blacklisted (logged out)
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({
        status: "Error",
        message: "Token has been invalidated. Please log in again.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    if (!req.user.userId) {
      return res.status(401).json({
        status: "Error",
        message: "Invalid token payload.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      status: "Error",
      message: "Invalid or expired token",
    });
  }
};

export default isAuthenticated;