import type { Request, Response } from "express";
import crypto from "node:crypto";
import { User } from "../models/User.js";
import { Membership } from "../models/Membership.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import {
  accessCookie,
  clearAuthCookies,
  ok,
  refreshCookie,
} from "../lib/http.js";
import {
  createPasswordReset,
  createSession,
  hashOpaqueToken,
  hashPassword,
  revokeAllSessions,
  revokeSession,
  rotateSession,
  verifyPassword,
} from "../services/auth.service.js";
import { PasswordResetToken } from "../models/Auth.js";
import { actionEmail, sendEmail } from "../services/email.service.js";

const publicUser = (user: any) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
  avatarColor: user.avatarColor,
  timezone: user.timezone,
  defaultCurrency: user.defaultCurrency,
  upiId: user.upiId,
  phone: user.phone,
  notificationPreferences: user.notificationPreferences,
  isGuest: user.isGuest,
  onboardingComplete: user.onboardingComplete,
});
const setSession = (
  res: Response,
  session: { access: string; refresh: string },
  remember = false,
) => {
  res.cookie("sm_access", session.access, accessCookie);
  res.cookie("sm_refresh", session.refresh, refreshCookie(remember));
};
export const signUp = asyncHandler(async (req, res) => {
  const existing = await User.findOne({ email: req.body.email }).select(
    "+passwordHash",
  );
  if (existing && !existing.isGuest)
    throw new AppError(
      409,
      "An account with this email already exists.",
      "EMAIL_TAKEN",
      [{ field: "email", message: "This email is already registered." }],
    );
  const user =
    existing ??
    new User({
      avatarColor: ["#6d5dfc", "#137a6c", "#bf5b2d", "#3269b7"][
        Math.floor(Math.random() * 4)
      ],
    });
  Object.assign(user, {
    name: req.body.name,
    email: req.body.email,
    timezone: req.body.timezone,
    defaultCurrency: req.body.defaultCurrency,
    passwordHash: await hashPassword(req.body.password),
    isGuest: false,
    claimedAt: existing?.isGuest ? new Date() : undefined,
  });
  await user.save();
  await Membership.updateMany(
    { email: user.email, status: "invited" },
    { userId: user._id, status: "active" },
  );
  const session = await createSession(String(user._id));
  setSession(res, session);
  ok(res, { user: publicUser(user) }, 201);
});
export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select(
    "+passwordHash",
  );
  if (
    !user ||
    !(await verifyPassword(
      String(user.passwordHash),
      String(req.body.password),
    ))
  )
    throw new AppError(
      401,
      "Invalid email or password.",
      "INVALID_CREDENTIALS",
    );
  user.lastSeenAt = new Date();
  await user.save();
  const remember = Boolean(req.body.remember);
  const session = await createSession(String(user._id), remember);
  setSession(res, session, remember);
  ok(res, { user: publicUser(user) });
});
export const refresh = asyncHandler(async (req, res) => {
  if (!req.cookies.sm_refresh)
    throw new AppError(401, "Session expired.", "UNAUTHORIZED");
  try {
    const session = await rotateSession(req.cookies.sm_refresh);
    setSession(res, session);
    const user = await User.findById(session.userId);
    ok(res, { refreshed: true, user: user ? publicUser(user) : undefined });
  } catch {
    clearAuthCookies(res);
    throw new AppError(401, "Session expired.", "UNAUTHORIZED");
  }
});
export const logout = asyncHandler(async (req, res) => {
  await revokeSession(req.cookies.sm_refresh);
  clearAuthCookies(res);
  ok(res, { loggedOut: true });
});
export const logoutAll = asyncHandler(async (req, res) => {
  await revokeAllSessions(req.auth!.userId);
  clearAuthCookies(res);
  ok(res, { loggedOut: true });
});
export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth!.userId);
  if (!user) throw new AppError(401, "Session expired.", "UNAUTHORIZED");
  ok(res, { user: publicUser(user) });
});
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const token = await createPasswordReset(String(user._id));
    const resetUrl = `${process.env.CLIENT_URL ?? process.env.CLIENT_ORIGIN ?? "http://localhost:5173"}/reset-password?token=${token}`;
    const email = actionEmail("Use this secure link to reset your SplitMate password.", resetUrl);
    await sendEmail({
      to: String(user.email),
      subject: "Reset your SplitMate password",
      ...email,
    });
  }
  ok(res, { accepted: true });
});
export const resetPassword = asyncHandler(async (req, res) => {
  const record = await PasswordResetToken.findOne({
    tokenHash: hashOpaqueToken(req.body.token),
    expiresAt: { $gt: new Date() },
  });
  if (!record)
    throw new AppError(
      400,
      "That reset link is invalid or expired.",
      "INVALID_RESET",
    );
  const user = await User.findById(record.userId).select("+passwordHash");
  if (!user)
    throw new AppError(400, "That reset link is invalid.", "INVALID_RESET");
  user.passwordHash = await hashPassword(req.body.password);
  await user.save();
  await PasswordResetToken.deleteMany({ userId: user._id });
  await revokeAllSessions(String(user._id));
  const session = await createSession(String(user._id));
  setSession(res, session);
  ok(res, { user: publicUser(user) });
});
export const updateMe = asyncHandler(async (req, res) => {
  const allowed = {
    name: req.body.name,
    timezone: req.body.timezone,
    defaultCurrency: req.body.defaultCurrency,
    upiId: req.body.upiId,
    phone: req.body.phone,
    notificationPreferences: req.body.notificationPreferences,
  };
  const user = await User.findByIdAndUpdate(
    req.auth!.userId,
    { $set: allowed },
    { new: true, runValidators: true },
  );
  ok(res, { user: publicUser(user) });
});
export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth!.userId).select("+passwordHash");
  if (!user)
    throw new AppError(401, "Session expired.", "UNAUTHORIZED");
  if (!(await verifyPassword(String(user.passwordHash), req.body.currentPassword)))
    throw new AppError(400, "Current password is incorrect.", "BAD_PASSWORD");
  user.passwordHash = await hashPassword(req.body.newPassword);
  await user.save();
  await revokeAllSessions(String(user._id));
  const session = await createSession(String(user._id));
  setSession(res, session);
  ok(res, { user: publicUser(user) });
});
