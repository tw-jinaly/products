import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("No authentication token provided", 401);
  }

  const token = authHeader.split(" ")[1];
  req.user = verifyAccessToken(token);
  next();
};

export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      req.user = verifyAccessToken(token);
    } catch {
      
    }
  }
  next();
};
