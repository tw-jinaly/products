import bcrypt from "bcryptjs";
import { IUser, UserModel } from "../../models/user.model.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import {
  GoogleAuthInput,
  LoginInput,
  RegisterInput,
} from "../validations/auth.validation.js";
import { AppError } from "../../errors/appError.js";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.config.js";

const BCRYPT_ROUNDS = 12;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
export interface SanitizedUser {
  id: string;
  name: string;
  email: string;
  role: IUser["role"];
}
export interface AuthResponse {
  user: SanitizedUser;
  tokens: TokenPair;
}
const buildTokenSession = async (userDoc: any): Promise<TokenPair> => {
  const payload = {
    userId: userDoc._id.toString(),
    role: userDoc.role,
  };

  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);

  userDoc.refreshToken = await bcrypt.hash(refreshToken, 10);
  await userDoc.save();

  return { accessToken, refreshToken };
};
export const registerService = async (
  input: RegisterInput
): Promise<AuthResponse> => {
  const emailTaken = await UserModel.exists({ email: input.email });
  if (emailTaken) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashPassword = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const newUser = await UserModel.create({
    name: input.name,
    email: input.email,
    password: hashPassword,
    role: "customer",
  });

  const tokens = await buildTokenSession(newUser);

  return {
    user: {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
    tokens,
  };
};

export const loginService = async (
  input: LoginInput
): Promise<AuthResponse> => {
  const user = await UserModel.findOne({ email: input.email }).select(
    "password + refreshToken"
  );

  if (!user || !user.password) {
    throw new AppError("Invalid email or password", 401);
  }
  if (!user.isActive) {
    throw new AppError("Your account has been deactivated", 403);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);
  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const tokens = await buildTokenSession(user);
  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    tokens,
  };
};

export const rotateRefreshToken = async (
  oldRefreshToken: string
): Promise<TokenPair> => {
  const decoded = verifyRefreshToken(oldRefreshToken);

  const user = await UserModel.findById(decoded.userId).select("+refreshToken");
  if (!user || !user.refreshToken) {
    throw new AppError(
      "Session invalid or expired. Please sign in again.",
      401
    );
  }

  const isValid = await bcrypt.compare(oldRefreshToken, user.refreshToken);
  if (!isValid) {
    user.refreshToken = undefined;
    await user.save();
    throw new AppError(
      "Token reuse detected. Session terminated for security.",
      403
    );
  }

  return buildTokenSession(user);
};

export const revokeSession = async (userId: string): Promise<void> => {
  await UserModel.findByIdAndUpdate(userId, { refreshToken: null });
};

const googleClientId = env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(googleClientId);

export const googleAuthService = async (
  input: GoogleAuthInput
): Promise<AuthResponse> => {
  if (!googleClientId || googleClientId === "your_google_client_id") {
    throw new AppError("Google OAuth is not configured on this server", 500);
  }

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: input.idToken,
      audience: googleClientId,
    });
  } catch {
    throw new AppError("Invalid or expired Google ID token", 401);
  }

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new AppError("Unable to retrieve email from Google token", 400);
  }

  if (payload.email_verified === false) {
    throw new AppError("Google email address is not verified", 400);
  }

  const googleId = payload.sub;
  const email = payload.email.toLowerCase();
  const name = payload.name || payload.given_name || email.split("@")[0];

  let user = await UserModel.findOne({
    $or: [{ googleId }, { email }],
  }).select("+refreshToken");

  if (user) {
    if (!user.isActive) {
      throw new AppError("Your account has been deactivated", 403);
    }

    if (!user.googleId) {
      user.googleId = googleId;
    }
  } else {
    user = await UserModel.create({
      name,
      email,
      googleId,
      role: "customer",
    });
  }

  const tokens = await buildTokenSession(user);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    tokens,
  };
};

