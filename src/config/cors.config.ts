import cors, { CorsOptions } from "cors";
import { AppError } from "../errors/appError.js";

const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError(`CORS policy blocks access from origin`, 403));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-REquested-With"],
};

export const corsMiddleware = cors(corsOptions);
