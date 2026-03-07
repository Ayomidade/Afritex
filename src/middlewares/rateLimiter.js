import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 20 * 60 * 1000,
  limit: 7,
  max: 7,
  message: "Too many attempt, try agin in 20 minutes.",
  legacyHeaders:false,
  standardHeaders:true
})

export default rateLimiter;