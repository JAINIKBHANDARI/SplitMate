import { Budget } from "../models/Budget.js";
import { Group } from "../models/Group.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { ok } from "../lib/http.js";
import { assertManager, membershipFor } from "../services/access.service.js";
import { recordActivity } from "../services/activity.service.js";
import { listBudgetUsage, budgetUsageFor } from "../services/budget.service.js";

const filterFor = (groupId: string) => ({
  groupId,
});

export const listBudgets = asyncHandler(async (req, res) => {
  const groupId = String(req.params.groupId);
  await membershipFor(req, groupId);
  ok(res, {
    budgets: await listBudgetUsage(filterFor(groupId), req.auth!.userId),
  });
});

export const createBudget = asyncHandler(async (req, res) => {
  const groupId = String(req.params.groupId);
  const actor = await membershipFor(req, groupId);
  assertManager(actor.role);
  const group = await Group.findById(groupId);
  if (!group) throw new AppError(404, "Group not found.", "NOT_FOUND");
  const budget = await Budget.create({
    ...req.body,
    groupId,
    userId: req.body.scope === "personal" ? req.auth!.userId : undefined,
    currency: group.currency,
    createdBy: req.auth!.userId,
    updatedBy: req.auth!.userId,
  });
  await recordActivity(
    groupId,
    req.auth!.userId,
    "budget.created",
    "Created a budget",
    { budgetId: String(budget._id) },
  );
  ok(res, { budget: await budgetUsageFor(budget, req.auth!.userId) }, 201);
});

export const updateBudget = asyncHandler(async (req, res) => {
  const groupId = String(req.params.groupId);
  const actor = await membershipFor(req, groupId);
  assertManager(actor.role);
  const budget = await Budget.findOneAndUpdate(
    { _id: String(req.params.budgetId), groupId },
    { $set: { ...req.body, updatedBy: req.auth!.userId } },
    { new: true, runValidators: true },
  );
  if (!budget) throw new AppError(404, "Budget not found.", "NOT_FOUND");
  await recordActivity(
    groupId,
    req.auth!.userId,
    "budget.updated",
    "Updated a budget",
    { budgetId: String(budget._id) },
  );
  ok(res, { budget: await budgetUsageFor(budget, req.auth!.userId) });
});

export const deleteBudget = asyncHandler(async (req, res) => {
  const groupId = String(req.params.groupId);
  const actor = await membershipFor(req, groupId);
  assertManager(actor.role);
  await Budget.deleteOne({ _id: String(req.params.budgetId), groupId });
  await recordActivity(
    groupId,
    req.auth!.userId,
    "budget.deleted",
    "Deleted a budget",
  );
  ok(res, { deleted: true });
});
