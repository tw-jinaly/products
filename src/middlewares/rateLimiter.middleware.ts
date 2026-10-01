import rateLimit from "express-rate-limit";
import { AppError } from "../errors/appError.js";

export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new AppError(
        "Too many requests from this IP, please try again after 15 minutes.",
        429
      )
    );
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new AppError(
        "Too many login attempts from this IP. Please try again after 15 minutes.",
        429
      )
    );
  },
});
