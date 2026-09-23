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
import { disconnect } from "cluster";

const app = express();

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timeStamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

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

const startServer = async () => {
  await connectDatabase();
  const server = app.listen(env.PORT, () => {
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

// app.listen(env.PORT, () => {
//   console.log(
//     `Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`
//   );
// });
