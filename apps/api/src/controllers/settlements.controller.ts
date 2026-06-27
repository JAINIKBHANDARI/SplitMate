import { Settlement } from "../models/Settlement.js";
import { Group } from "../models/Group.js";
import { Membership } from "../models/Membership.js";
import { User } from "../models/User.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { ok } from "../lib/http.js";
import { canManage, membershipFor } from "../services/access.service.js";
import { recordActivity } from "../services/activity.service.js";
import { calculateGroupBalances } from "../services/balance.service.js";
import { notifyUser } from "../services/notification.service.js";

const upiLinkFor = (
  upiId: string | undefined,
  name: string,
  amountMinor: number,
  note = "SplitMate settlement",
) => {
  if (!upiId) return undefined;
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    am: (amountMinor / 100).toFixed(2),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
};

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
  const actor = await membershipFor(req, id);
  const group = await Group.findById(id);
  if (!group || group.archived)
    throw new AppError(409, "This group is read-only.", "GROUP_ARCHIVED");
  if (req.body.fromUserId !== req.auth!.userId && !canManage(actor.role))
    throw new AppError(
      403,
      "Only the payer or a group admin can initiate this settlement.",
      "FORBIDDEN",
    );
  if (
    ["confirmed", "completed"].includes(req.body.status) &&
    !canManage(actor.role)
  )
    throw new AppError(
      403,
      "Receiver confirmation is required before a settlement is completed.",
      "FORBIDDEN",
    );
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
  const balance = await calculateGroupBalances(id);
  const from = balance.balances.find(
    (item) => item.userId === req.body.fromUserId,
  );
  const to = balance.balances.find((item) => item.userId === req.body.toUserId);
  const outstanding = Math.min(
    Math.max(0, -(from?.amountMinor ?? 0)),
    Math.max(0, to?.amountMinor ?? 0),
  );
  if (outstanding <= 0 || req.body.amountMinor > outstanding)
    throw new AppError(
      422,
      "Settlement amount cannot exceed the outstanding balance.",
      "OVERPAYMENT",
    );
  const receiver = await User.findById(req.body.toUserId).lean();
  const status =
    req.body.status === "completed" ? "confirmed" : req.body.status ?? "pending";
  const confirmedAt = status === "confirmed" ? new Date() : undefined;
  const settlement = await Settlement.create({
    ...req.body,
    groupId: group._id,
    currency: group.currency,
    requestedBy: req.auth!.userId,
    status,
    confirmedAt,
    confirmedBy: status === "confirmed" ? req.auth!.userId : undefined,
    settledAt: confirmedAt,
    upiLink:
      req.body.method === "upi"
        ? upiLinkFor(
            receiver?.upiId ? String(receiver.upiId) : undefined,
            receiver?.name ? String(receiver.name) : "SplitMate",
            req.body.amountMinor,
            req.body.note,
          )
        : undefined,
  });
  await notifyUser(req.body.toUserId, {
    groupId: id,
    type: "settlement.pending",
    title: "Settlement needs confirmation",
    body: "A payment was recorded and is waiting for your confirmation.",
    href: `/app/groups/${id}/balances`,
  });
  await recordActivity(
    id,
    req.auth!.userId,
    "settlement.initiated",
    "Initiated a settlement",
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
  const status = req.body.status;
  if (status === "sent" && String(settlement.fromUserId) !== req.auth!.userId)
    throw new AppError(403, "Only the payer can mark payment sent.", "FORBIDDEN");
  if (status === "confirmed" && String(settlement.toUserId) !== req.auth!.userId)
    throw new AppError(403, "Only the receiver can confirm payment.", "FORBIDDEN");
  if (
    ["cancelled", "rejected"].includes(status) &&
    !["owner", "admin"].includes(actor.role) &&
    ![String(settlement.fromUserId), String(settlement.toUserId)].includes(req.auth!.userId)
  )
    throw new AppError(403, "You cannot close this settlement.", "FORBIDDEN");
  Object.assign(settlement, {
    ...req.body,
    sentAt: status === "sent" ? new Date() : settlement.sentAt,
    confirmedAt: status === "confirmed" ? new Date() : settlement.confirmedAt,
    confirmedBy: status === "confirmed" ? req.auth!.userId : settlement.confirmedBy,
    cancelledAt:
      ["cancelled", "rejected"].includes(status) ? new Date() : settlement.cancelledAt,
    settledAt: status === "confirmed" ? new Date() : settlement.settledAt,
  });
  await settlement.save();
  if (status === "sent")
    await notifyUser(String(settlement.toUserId), {
      groupId: id,
      type: "settlement.sent",
      title: "Payment marked sent",
      body: "Confirm receipt when the money reaches you.",
      href: `/app/groups/${id}/balances`,
    });
  await recordActivity(
    id,
    req.auth!.userId,
    settlement.status === "cancelled"
      ? "settlement.cancelled"
      : settlement.status === "confirmed"
        ? "settlement.confirmed"
        : "settlement.updated",
    settlement.status === "cancelled"
      ? "Cancelled a settlement"
      : settlement.status === "confirmed"
        ? "Confirmed a settlement"
      : "Updated a settlement",
  );
  ok(res, { settlement });
});
