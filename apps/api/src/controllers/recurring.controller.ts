import { calculateSplit, SplitValidationError } from "@splitmate/shared";
import { Group } from "../models/Group.js";
import { Membership } from "../models/Membership.js";
import { RecurringExpense } from "../models/RecurringExpense.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { ok } from "../lib/http.js";
import { env } from "../config/env.js";
import { membershipFor } from "../services/access.service.js";
import { recordActivity } from "../services/activity.service.js";
import { generateDueRecurringExpenses } from "../services/recurring.service.js";

async function materializeRecurring(req: any) {
  const group = await Group.findById(req.params.groupId);
  if (!group) throw new AppError(404, "Group not found.", "NOT_FOUND");
  if (group.archived)
    throw new AppError(409, "Archived groups are read-only.", "GROUP_ARCHIVED");
  const active = await Membership.find({
    groupId: group._id,
    status: "active",
  }).lean();
  const ids = new Set(active.map((member) => String(member.userId)));
  if (
    !ids.has(req.body.paidBy) ||
    req.body.participants.some((participant: any) => !ids.has(participant.userId))
  )
    throw new AppError(
      422,
      "Payer and participants must be active group members.",
      "INVALID_MEMBER",
    );
  try {
    calculateSplit(req.body.amountMinor, req.body.splitType, req.body.participants);
  } catch (error) {
    if (error instanceof SplitValidationError)
      throw new AppError(422, error.message, "INVALID_SPLIT");
    throw error;
  }
  return { group, payload: { ...req.body, currency: group.currency } };
}

export const listRecurring = asyncHandler(async (req, res) => {
  const groupId = String(req.params.groupId);
  await membershipFor(req, groupId);
  const recurring = await RecurringExpense.find({ groupId })
    .populate("paidBy", "name avatarColor")
    .sort({ nextOccurrenceDate: 1 });
  ok(res, { recurring });
});

export const createRecurring = asyncHandler(async (req, res) => {
  const groupId = String(req.params.groupId);
  await membershipFor(req, groupId);
  const { payload } = await materializeRecurring(req);
  const recurring = await RecurringExpense.create({
    ...payload,
    groupId,
    nextOccurrenceDate: payload.nextOccurrenceDate ?? payload.startDate,
    createdBy: req.auth!.userId,
    updatedBy: req.auth!.userId,
  });
  await recordActivity(
    groupId,
    req.auth!.userId,
    "recurring.created",
    `Created recurring rule for ${recurring.title}`,
    { recurringExpenseId: String(recurring._id) },
  );
  ok(res, { recurring }, 201);
});

export const updateRecurring = asyncHandler(async (req, res) => {
  const groupId = String(req.params.groupId);
  await membershipFor(req, groupId);
  const recurring = await RecurringExpense.findOneAndUpdate(
    { _id: String(req.params.recurringId), groupId },
    { $set: { ...req.body, updatedBy: req.auth!.userId } },
    { new: true, runValidators: true },
  );
  if (!recurring)
    throw new AppError(404, "Recurring rule not found.", "NOT_FOUND");
  await recordActivity(
    groupId,
    req.auth!.userId,
    "recurring.updated",
    `Updated recurring rule for ${recurring.title}`,
    { recurringExpenseId: String(recurring._id) },
  );
  ok(res, { recurring });
});

export const deleteRecurring = asyncHandler(async (req, res) => {
  const groupId = String(req.params.groupId);
  await membershipFor(req, groupId);
  await RecurringExpense.deleteOne({
    _id: String(req.params.recurringId),
    groupId,
  });
  await recordActivity(
    groupId,
    req.auth!.userId,
    "recurring.deleted",
    "Deleted a recurring rule",
  );
  ok(res, { deleted: true });
});

export const runRecurringCron = asyncHandler(async (req, res) => {
  if (!env.CRON_SECRET || req.get("x-cron-secret") !== env.CRON_SECRET)
    throw new AppError(401, "Invalid cron secret.", "UNAUTHORIZED");
  ok(res, await generateDueRecurringExpenses());
});
