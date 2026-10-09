import { TokenPayload } from "../utils/jwt.ts";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
