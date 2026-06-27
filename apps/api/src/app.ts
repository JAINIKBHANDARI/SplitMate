import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import path from "node:path";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import { env, isProduction } from "./config/env.js";
import { csrfGuard } from "./middleware/auth.js";
import { errorHandler } from "./lib/errors.js";
import { ok } from "./lib/http.js";
import { authRouter } from "./routes/auth.routes.js";
import { groupsRouter } from "./routes/groups.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { attachmentsRouter } from "./routes/attachments.routes.js";
import { recurringRouter } from "./routes/recurring.routes.js";
import { notificationsRouter } from "./routes/notifications.routes.js";
import { openapi } from "./docs/openapi.js";

export const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: isProduction ? undefined : false }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.CORS_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
  }),
);
app.use(morgan(isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "512kb" }));
app.use(cookieParser());
app.use(csrfGuard);
app.get("/api/health", (_req, res) =>
  ok(res, {
    success: true,
    service: "splitmate-api",
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "unavailable",
  }),
);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 40,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  authRouter,
);
app.use("/api/groups", groupsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/analytics", dashboardRouter);
app.use("/api/users", usersRouter);
app.use("/api/attachments", attachmentsRouter);
app.use("/api/recurring", recurringRouter);
app.use("/api/notifications", notificationsRouter);
if (isProduction) {
  const staticDir = path.resolve(
    process.cwd(),
    process.env.STATIC_DIR ?? "../web/dist",
  );
  app.use(express.static(staticDir));
  app.get("*", (_req, res) => res.sendFile(path.join(staticDir, "index.html")));
}
app.use(errorHandler);
