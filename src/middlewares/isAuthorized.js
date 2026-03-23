export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "Error",
        message: "You are not authorized to perform this action.",
      });
    }
    next();
  };
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ status: "Error", message: "Admin access only." });
  }

  next();
};
