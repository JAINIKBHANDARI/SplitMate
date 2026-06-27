import "dotenv/config";
import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/splitmate"),
  MONGO_URI: z.preprocess(emptyToUndefined, z.string().optional()),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32)
    .default("development-access-secret-change-me-123"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .default("development-refresh-secret-change-me"),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  CLIENT_URL: z.preprocess(emptyToUndefined, z.string().optional()),
  CORS_ORIGINS: z.preprocess(emptyToUndefined, z.string().optional()),
  COOKIE_SECURE: z.enum(["true", "false"]).default("false"),
  COOKIE_DOMAIN: z.preprocess(emptyToUndefined, z.string().optional()),
  COOKIE_SAMESITE: z
    .preprocess(emptyToUndefined, z.enum(["lax", "none", "strict"]).optional()),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  EMAIL_HOST: z.preprocess(emptyToUndefined, z.string().optional()),
  EMAIL_PORT: z.coerce.number().optional(),
  EMAIL_USER: z.preprocess(emptyToUndefined, z.string().optional()),
  EMAIL_PASS: z.preprocess(emptyToUndefined, z.string().optional()),
  EMAIL_FROM: z.preprocess(emptyToUndefined, z.string().optional()),
  CLOUDINARY_CLOUD_NAME: z.preprocess(emptyToUndefined, z.string().optional()),
  CLOUDINARY_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  CLOUDINARY_API_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  CRON_SECRET: z.preprocess(emptyToUndefined, z.string().min(20).optional()),
});
const parsed = schema.parse(process.env);
if (parsed.NODE_ENV === "production") {
  const missing = [
    [parsed.MONGO_URI || parsed.MONGODB_URI, "MONGO_URI"],
    [parsed.JWT_ACCESS_SECRET, "JWT_ACCESS_SECRET"],
    [parsed.JWT_REFRESH_SECRET, "JWT_REFRESH_SECRET"],
    [parsed.CLIENT_URL || parsed.CLIENT_ORIGIN, "CLIENT_URL"],
  ]
    .filter(([value]) => !value)
    .map(([, name]) => name);
  const usingDevSecret =
    parsed.JWT_ACCESS_SECRET.includes("development-") ||
    parsed.JWT_REFRESH_SECRET.includes("development-") ||
    parsed.JWT_ACCESS_SECRET.includes("change-me") ||
    parsed.JWT_REFRESH_SECRET.includes("change-me");
  const usingLocalMongo = (parsed.MONGO_URI || parsed.MONGODB_URI).includes("localhost");
  if (missing.length || usingDevSecret || usingLocalMongo) {
    throw new Error(
      `Missing or unsafe production environment variables: ${[
        ...missing,
        ...(usingDevSecret ? ["JWT_ACCESS_SECRET/JWT_REFRESH_SECRET"] : []),
        ...(usingLocalMongo ? ["MONGO_URI"] : []),
      ].join(", ")}`,
    );
  }
}
export const env = {
  ...parsed,
  MONGODB_URI: parsed.MONGO_URI || parsed.MONGODB_URI,
  CLIENT_ORIGIN: parsed.CLIENT_URL || parsed.CLIENT_ORIGIN,
  COOKIE_SAMESITE:
    parsed.COOKIE_SAMESITE ?? (parsed.NODE_ENV === "production" ? "none" : "lax"),
  CORS_ORIGINS:
    parsed.CORS_ORIGINS
      ?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [parsed.CLIENT_URL || parsed.CLIENT_ORIGIN],
};
export const isProduction = env.NODE_ENV === "production";
