const errorHandler = (err, req, res, next) => {
  // console.log(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }

  if (err.name === "TokenExpired") {
    statusCode = 401;
    message = "Token expired";
  }

  // if (err.statusCode === 404) {
  //   message = "Invalid route";
  // }

  res.status(statusCode).json({ status: "Failed", message });
};


export default errorHandler