import type { Request } from "express";
import { Membership } from "../models/Membership.js";
import { AppError } from "../lib/errors.js";

export async function membershipFor(req: Request, groupId: string) {
  const membership = await Membership.findOne({
    groupId,
    userId: req.auth!.userId,
    status: "active",
  });
  if (!membership)
    throw new AppError(
      403,
      "You do not have access to this group.",
      "FORBIDDEN",
    );
  return membership;
}
export function canManage(role: string) {
  return role === "owner" || role === "admin";
}
export function assertManager(role: string) {
  if (!canManage(role))
    throw new AppError(403, "Only group admins can do that.", "FORBIDDEN");
}
