import type { Request } from "express";
import crypto from "node:crypto";
import { Group } from "../models/Group.js";
import { Membership } from "../models/Membership.js";
import { User } from "../models/User.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { ok } from "../lib/http.js";
import { assertManager, membershipFor } from "../services/access.service.js";
import { recordActivity } from "../services/activity.service.js";
import { calculateGroupBalances } from "../services/balance.service.js";

const groupFilter = (req: Request) => ({ _id: String(req.params.groupId) });
export const listGroups = asyncHandler(async (req, res) => {
  const memberships = await Membership.find({
    userId: req.auth!.userId,
    status: "active",
  }).lean();
  const ids = memberships.map((item) => item.groupId);
  const groups = await Group.find({ _id: { $in: ids } })
    .sort({ updatedAt: -1 })
    .lean();
  const data = await Promise.all(
    groups.map(async (group) => ({
      ...group,
      id: String(group._id),
      memberCount:
        memberships.filter(
          (membership) => String(membership.groupId) === String(group._id),
        ).length ||
        (await Membership.countDocuments({
          groupId: group._id,
          status: "active",
        })),
    })),
  );
  ok(res, { groups: data });
});
export const createGroup = asyncHandler(async (req, res) => {
  const group = await Group.create({
    ...req.body,
    createdBy: req.auth!.userId,
    inviteCode: crypto.randomBytes(5).toString("base64url"),
  });
  await Membership.create({
    groupId: group._id,
    userId: req.auth!.userId,
    role: "owner",
    status: "active",
  });
  await recordActivity(
    String(group._id),
    req.auth!.userId,
    "group.created",
    "Created the group",
  );
  ok(res, { group }, 201);
});
export const getGroup = asyncHandler(async (req, res) => {
  const id = String(req.params.groupId);
  await membershipFor(req, id);
  const [group, members, balances] = await Promise.all([
    Group.findOne(groupFilter(req)),
    Membership.find({ groupId: id, status: { $ne: "removed" } }).populate(
      "userId",
      "name email avatarColor",
    ),
    calculateGroupBalances(id),
  ]);
  if (!group) throw new AppError(404, "Group not found.", "NOT_FOUND");
  ok(res, { group, members, balances });
});
export const updateGroup = asyncHandler(async (req, res) => {
  const id = String(req.params.groupId);
  const membership = await membershipFor(req, id);
  assertManager(membership.role);
  const group = await Group.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true },
  );
  await recordActivity(
    id,
    req.auth!.userId,
    "group.updated",
    "Updated group settings",
  );
  ok(res, { group });
});
export const archiveGroup = asyncHandler(async (req, res) => {
  const id = String(req.params.groupId);
  const membership = await membershipFor(req, id);
  assertManager(membership.role);
  const group = await Group.findByIdAndUpdate(
    id,
    { archived: req.body.archived ?? true },
    { new: true },
  );
  await recordActivity(
    id,
    req.auth!.userId,
    "group.archived",
    group!.archived ? "Archived the group" : "Restored the group",
  );
  ok(res, { group });
});
export const inviteMember = asyncHandler(async (req, res) => {
  const id = String(req.params.groupId);
  const actor = await membershipFor(req, id);
  assertManager(actor.role);
  const group = await Group.findById(id);
  if (!group) throw new AppError(404, "Group not found.", "NOT_FOUND");
  const user = await User.findOne({ email: req.body.email });
  const existing = await Membership.findOne({
    groupId: group._id,
    $or: [{ email: req.body.email }, ...(user ? [{ userId: user._id }] : [])],
  });
  if (existing && existing.status !== "removed")
    throw new AppError(
      409,
      "That person is already in this group.",
      "ALREADY_MEMBER",
    );
  const membership = existing
    ? await Membership.findByIdAndUpdate(
        existing._id,
        {
          userId: user?._id,
          email: req.body.email,
          status: user ? "active" : "invited",
        },
        { new: true },
      )
    : await Membership.create({
        groupId: group._id,
        userId: user?._id,
        email: req.body.email,
        status: user ? "active" : "invited",
      });
  await recordActivity(
    id,
    req.auth!.userId,
    "member.invited",
    `Invited ${req.body.email}`,
  );
  ok(res, { membership, inviteCode: group.inviteCode }, 201);
});
export const joinGroup = asyncHandler(async (req, res) => {
  const group = await Group.findOne({
    inviteCode: String(req.params.inviteCode),
    archived: false,
  });
  if (!group)
    throw new AppError(
      404,
      "That invite is invalid or unavailable.",
      "INVALID_INVITE",
    );
  const existing = await Membership.findOne({
    groupId: group._id,
    userId: req.auth!.userId,
  });
  if (existing?.status === "active") return ok(res, { group, joined: false });
  if (existing)
    await Membership.updateOne({ _id: existing._id }, { status: "active" });
  else
    await Membership.create({ groupId: group._id, userId: req.auth!.userId });
  await recordActivity(
    String(group._id),
    req.auth!.userId,
    "member.joined",
    "Joined the group",
  );
  ok(res, { group, joined: true });
});
export const updateRole = asyncHandler(async (req, res) => {
  const id = String(req.params.groupId);
  const actor = await membershipFor(req, id);
  assertManager(actor.role);
  const membership = await Membership.findOne({
    _id: String(req.params.membershipId),
    groupId: id,
  });
  if (!membership) throw new AppError(404, "Member not found.", "NOT_FOUND");
  if (membership.role === "owner")
    throw new AppError(
      400,
      "The owner role cannot be changed.",
      "OWNER_LOCKED",
    );
  membership.role = req.body.role;
  await membership.save();
  ok(res, { membership });
});
export const removeMember = asyncHandler(async (req, res) => {
  const id = String(req.params.groupId);
  const actor = await membershipFor(req, id);
  assertManager(actor.role);
  const membership = await Membership.findOne({
    _id: String(req.params.membershipId),
    groupId: id,
  });
  if (!membership || membership.role === "owner")
    throw new AppError(400, "This member cannot be removed.", "MEMBER_LOCKED");
  membership.status = "removed";
  await membership.save();
  await recordActivity(
    id,
    req.auth!.userId,
    "member.removed",
    "Removed a member",
  );
  ok(res, { removed: true });
});
