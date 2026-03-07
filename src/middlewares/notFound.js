const notFound = (req, res, next) => {
  const error = new Error("Invalid endpoint.")
  error.statusCode = 404;
  next(error)
}

export default notFound;