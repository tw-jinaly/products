import { Request, Response, ErrorRequestHandler, NextFunction } from "express";
import { AppError } from "../errors/appError.js";
import { env } from "../config/env.config.js";

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  const status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";

  res.status(statusCode).json({
    status,
    message,
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
