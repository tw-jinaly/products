import { Request, Response } from "express";
import { AppError } from "../../errors/appError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  googleAuthService,
  loginService,
  registerService,
  revokeSession,
  rotateRefreshToken,
} from "../services/auth.service.js";
import {
  GoogleAuthInput,
  LoginInput,
  RegisterInput,
} from "../validations/auth.validation.js";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerService(req.body as RegisterInput);

  res.cookie(
    "refreshToken",
    result.tokens.refreshToken,
    REFRESH_COOKIE_OPTIONS
  );

  res.status(201).json({
    status: "success",
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginService(req.body as LoginInput);

  res.cookie(
    "refreshToken",
    result.tokens.refreshToken,
    REFRESH_COOKIE_OPTIONS
  );

  res.status(200).json({
    status: "success",
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  if (!incomingRefreshToken) {
    throw new AppError("No refresh token provided", 401);
  }

  const tokens = await rotateRefreshToken(incomingRefreshToken);

  res.cookie("refreshToken", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(200).json({
    status: "success",
    data: {
      accessToken: tokens.accessToken,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.userId) {
    await revokeSession(req.user.userId);
  }

  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const result = await googleAuthService(req.body as GoogleAuthInput);

  res.cookie(
    "refreshToken",
    result.tokens.refreshToken,
    REFRESH_COOKIE_OPTIONS
  );

  res.status(200).json({
    status: "success",
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
});
