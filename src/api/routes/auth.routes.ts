import { Router } from "express";
import {
  googleAuth,
  login,
  logout,
  refresh,
  register,
} from "../controllers/auth.controller.js";
import {
  googleAuthSchema,
  loginSchema,
  registerSchema,
} from "../validations/auth.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authLimiter } from "../../middlewares/rateLimiter.middleware.js";
import { optionalAuthenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authLimiter);

router.post("/register", validate(registerSchema, "body"), register);
router.post("/login", validate(loginSchema, "body"), login);
router.post("/google", validate(googleAuthSchema, "body"), googleAuth);
router.post("/refresh", refresh);
router.post("/logout", optionalAuthenticate, logout);

export const authRouter = router;
