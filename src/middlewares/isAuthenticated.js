import jwt from "jsonwebtoken"

const isAuthenticated = (req, res, next)=>{
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({status:"Error", message:"No token found."})
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    req.user = decoded;
    next()
  } catch (error) {
    // res.status(401).json({status:"error", message:"Invalid or expired token"})
    next(error)
  }
}

export default isAuthenticated;