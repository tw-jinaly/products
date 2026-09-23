import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(2000),
  MONGO_URI: z
    .string({ message: "MONGO_URI is required" })
    .default("mongodb://localhost:27017/shopscale"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables : ", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
