export const addtoCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
  } catch (error) {
    next(error)
  }
}