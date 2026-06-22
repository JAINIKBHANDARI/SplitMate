import argon2 from "argon2";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { RefreshToken, PasswordResetToken } from "../models/Auth.js";

const issuer = "splitmate-api";
const audience = "splitmate-web";
type Claims = { sub: string; jti?: string };
export const hashPassword = (password: string) =>
  argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
export const verifyPassword = (hash: string, password: string) =>
  argon2.verify(hash, password);
export const hashOpaqueToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string, remember = false) {
  const jti = crypto.randomUUID();
  const access = jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
    issuer,
    audience,
  });
  const refresh = jwt.sign({ sub: userId, jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: remember ? "30d" : "7d",
    issuer,
    audience,
  });
  const decoded = jwt.decode(refresh) as { exp: number };
  await RefreshToken.create({
    userId,
    tokenId: jti,
    expiresAt: new Date(decoded.exp * 1000),
  });
  return { access, refresh };
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
    tokenId: payload.jti,
    userId: payload.sub,
    revokedAt: { $exists: false },
  });
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
        { tokenId: payload.jti },
        { revokedAt: new Date() },
      );
  } catch {
    /* token is already unusable */
  }
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
