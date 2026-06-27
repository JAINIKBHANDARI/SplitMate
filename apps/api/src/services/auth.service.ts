import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { RefreshToken, PasswordResetToken } from "../models/Auth.js";

const issuer = "splitmate-api";
const audience = "splitmate-web";
type Claims = { sub: string; jti?: string };
export const hashPassword = (password: string) =>
  bcrypt.hash(password, 12);
export const verifyPassword = (hash: string, password: string) =>
  bcrypt.compare(password, hash);
export const hashOpaqueToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string, remember = false) {
  const jti = crypto.randomUUID();
  const access = jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
    issuer,
    audience,
  });
  const refresh = jwt.sign({ sub: userId, jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: (remember ? "30d" : env.REFRESH_TOKEN_EXPIRES_IN) as SignOptions["expiresIn"],
    issuer,
    audience,
  });
  const decoded = jwt.decode(refresh) as { exp: number };
  await RefreshToken.create({
    userId,
    tokenId: hashOpaqueToken(jti),
    tokenHash: hashOpaqueToken(refresh),
    expiresAt: new Date(decoded.exp * 1000),
  });
  return { access, refresh, userId };
}
export function verifyAccess(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer,
    audience,
  }) as jwt.JwtPayload & Claims;
}
export async function rotateSession(token: string, remember = false) {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer,
    audience,
  }) as jwt.JwtPayload & Claims;
  if (!payload.sub || !payload.jti) throw new Error("Invalid refresh token");
  const stored = await RefreshToken.findOne({
    tokenHash: hashOpaqueToken(token),
    userId: payload.sub,
  });
  if (stored?.revokedAt) {
    await RefreshToken.updateMany(
      { userId: payload.sub, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
    throw new Error("Refresh token reuse detected");
  }
  if (!stored || stored.expiresAt < new Date())
    throw new Error("Refresh token expired");
  stored.revokedAt = new Date();
  await stored.save();
  return createSession(payload.sub, remember);
}
export async function revokeSession(token?: string) {
  if (!token) return;
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer,
      audience,
    }) as jwt.JwtPayload & Claims;
    if (payload.jti)
      await RefreshToken.updateOne(
        { tokenHash: hashOpaqueToken(token) },
        { revokedAt: new Date() },
      );
  } catch {
    /* token is already unusable */
  }
}
export async function revokeAllSessions(userId: string) {
  await RefreshToken.updateMany(
    { userId, revokedAt: { $exists: false } },
    { revokedAt: new Date() },
  );
}
export async function createPasswordReset(userId: string) {
  await PasswordResetToken.deleteMany({ userId });
  const token = crypto.randomBytes(32).toString("base64url");
  await PasswordResetToken.create({
    userId,
    tokenHash: hashOpaqueToken(token),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  return token;
}
