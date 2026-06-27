import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/errors.js";
import { verifyAccess } from "../services/auth.service.js";
import { User } from "../models/User.js";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token =
      req.cookies.sm_access ||
      req.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token)
      throw new AppError(401, "Please sign in to continue.", "UNAUTHORIZED");
    const claims = verifyAccess(token);
    if (typeof claims.sub !== "string" || !claims.sub)
      throw new Error("No subject");
    const userId = claims.sub;
    const user = await User.findById(userId)
      .select("name email")
      .lean<{ _id: unknown; name: string; email: string }>();
    if (!user) throw new AppError(401, "Session expired.", "UNAUTHORIZED");
    req.auth = { userId, claims };
    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
    };
    next();
  } catch {
    next(
      new AppError(
        401,
        "Your session has expired. Please sign in again.",
        "UNAUTHORIZED",
      ),
    );
  }
}
export function csrfGuard(req: Request, _res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (
    origin &&
    origin !== process.env.CLIENT_ORIGIN &&
    !(
      process.env.NODE_ENV !== "production" &&
      origin === "http://localhost:5173"
    )
  )
    return next(new AppError(403, "Invalid request origin.", "CSRF_REJECTED"));
  next();
}
