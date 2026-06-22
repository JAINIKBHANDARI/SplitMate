import { Settlement } from "../models/Settlement.js";
import { Group } from "../models/Group.js";
import { Membership } from "../models/Membership.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { ok } from "../lib/http.js";
import { membershipFor } from "../services/access.service.js";
import { recordActivity } from "../services/activity.service.js";
import { calculateGroupBalances } from "../services/balance.service.js";

export const balances = asyncHandler(async (req, res) => {
  const id = String(req.params.groupId);
  await membershipFor(req, id);
  ok(res, await calculateGroupBalances(id));
});
export const listSettlements = asyncHandler(async (req, res) => {
  const id = String(req.params.groupId);
  await membershipFor(req, id);
  const settlements = await Settlement.find({ groupId: id })
    .populate("fromUserId toUserId", "name avatarColor")
    .sort({ settledAt: -1 })
    .limit(100);
  ok(res, { settlements });
});
export const createSettlement = asyncHandler(async (req, res) => {
  const id = String(req.params.groupId);
  await membershipFor(req, id);
  const group = await Group.findById(id);
  if (!group || group.archived)
    throw new AppError(409, "This group is read-only.", "GROUP_ARCHIVED");
  const active =
    (await Membership.exists({
      groupId: group._id,
      userId: req.body.fromUserId,
      status: "active",
    })) &&
    (await Membership.exists({
      groupId: group._id,
      userId: req.body.toUserId,
      status: "active",
    }));
  if (!active)
    throw new AppError(
      422,
      "Both people must be active members.",
      "INVALID_MEMBER",
    );
  const settlement = await Settlement.create({
    ...req.body,
    groupId: group._id,
    currency: group.currency,
  });
  await recordActivity(
    id,
    req.auth!.userId,
    "settlement.recorded",
    "Recorded a settlement",
    { settlementId: String(settlement._id) },
  );
  ok(res, { settlement }, 201);
});
export const updateSettlement = asyncHandler(async (req, res) => {
  const id = String(req.params.groupId);
  const actor = await membershipFor(req, id);
  const settlement = await Settlement.findOne({
    _id: String(req.params.settlementId),
    groupId: id,
  });
  if (!settlement)
    throw new AppError(404, "Settlement not found.", "NOT_FOUND");
  if (
    req.body.status === "cancelled" &&
    !["owner", "admin"].includes(actor.role) &&
    String(settlement.fromUserId) !== req.auth!.userId
  )
    throw new AppError(403, "You cannot cancel this settlement.", "FORBIDDEN");
  Object.assign(settlement, req.body);
  await settlement.save();
  await recordActivity(
    id,
    req.auth!.userId,
    settlement.status === "cancelled"
      ? "settlement.cancelled"
      : "settlement.updated",
    settlement.status === "cancelled"
      ? "Cancelled a settlement"
      : "Updated a settlement",
  );
  ok(res, { settlement });
});
