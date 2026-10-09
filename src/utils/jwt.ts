import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "../models/user.model.js";
import { AppError } from "../errors/appError.js";

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  "fallback_super_secret_access_key_min_32_chars";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "fallback_super_secret_refresh_key_min_32_chars";

const ACCESS_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN ||
  "15m") as SignOptions["expiresIn"];
const REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN ||
  "7d") as SignOptions["expiresIn"];

export const createAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
};

export const createRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch (error) {
    throw new AppError("Invalid or expired access token", 401);
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }
};
