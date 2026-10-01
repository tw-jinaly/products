process.on("uncaughtException", (error: Error) => {
  console.error("Uncaight Exception:", error);
  console.error(error.name, error.message);
  console.error(error.stack);

  process.exit(1);
});

import express, { Request, Response, NextFunction } from "express";
import { asyncHandler } from "./utils/asyncHandler.js";
import { AppError } from "./errors/appError.js";
import { env } from "./config/env.config.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { productRouter } from "./api/routes/product.routes.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./config/database.config.js";
import { Server } from "http";
import { corsMiddleware } from "./config/cors.config.js";
import { generalApiLimiter } from "./middlewares/rateLimiter.middleware.js";

const app = express();
app.use(corsMiddleware);

app.use(express.json({ limit: "10kb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timeStamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

app.use("/api", generalApiLimiter);

app.use("/api/v1/products", productRouter);

app.get(
  "/test-error",
  asyncHandler(async (_req: Request, _res: Response) => {
    throw new AppError("This is a simulated 404 error!", 404);
  })
);

app.use((req: Request, _res: Response, next: NextFunction) => {
  next(
    new AppError(
      `Cannot find ${req.method} ${req.originalUrl} on this server`,
      404
    )
  );
});

app.use(errorHandler);

let server: Server;

const startServer = async () => {
  await connectDatabase();
  server = app.listen(env.PORT, () => {
    console.log("Server running");
  });

  const shutdown = async (signal: string) => {
    console.log("Initiating shutdown");
    server.close(async () => {
      console.log("server closed");
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.on("SIGNIT", () => shutdown("SIGININT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer();

process.on("unhandleRejection", (reason: unknown) => {
  console.error("unhandled rejection");
  console.error(reason);

  if (server) {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// app.listen(env.PORT, () => {
//   console.log(
//     `Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`
//   );
// });
