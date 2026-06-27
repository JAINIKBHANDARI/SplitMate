import type { CookieOptions, Response } from "express";
import { env, isProduction } from "../config/env.js";

const baseCookie: CookieOptions = {
  httpOnly: true,
  secure: isProduction || env.COOKIE_SECURE === "true",
  sameSite: env.COOKIE_SAMESITE,
  domain: env.COOKIE_DOMAIN,
  path: "/",
};
export const accessCookie = { ...baseCookie, maxAge: 15 * 60 * 1000 };
export const refreshCookie = (remember = false): CookieOptions => ({
  ...baseCookie,
  path: "/api/auth",
  maxAge: (remember ? 30 : 7) * 24 * 60 * 60 * 1000,
});
export const clearAuthCookies = (res: Response) => {
  res.clearCookie("sm_access", accessCookie);
  res.clearCookie("sm_refresh", { ...baseCookie, path: "/api/auth" });
};
export const ok = <T>(res: Response, data: T, status = 200) =>
  res.status(status).json({ data });
