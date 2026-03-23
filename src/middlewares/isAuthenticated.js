import jwt from "jsonwebtoken";

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // FORCE STRUCTURE CONSISTENCY
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