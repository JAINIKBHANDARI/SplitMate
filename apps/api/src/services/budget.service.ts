import { calculateBudgetUsage } from "@splitmate/shared";
import { Budget } from "../models/Budget.js";
import { Expense } from "../models/Expense.js";

const monthRange = (month: string) => {
  const [year, rawMonth] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, rawMonth - 1, 1));
  const end = new Date(Date.UTC(year, rawMonth, 1));
  return { start, end };
};

export async function budgetUsageFor(budget: any, userId?: string) {
  const { start, end } = monthRange(budget.month);
  const match: Record<string, unknown> = {
    deletedAt: { $exists: false },
    expenseDate: { $gte: start, $lt: end },
  };
  if (budget.groupId) match.groupId = budget.groupId;
  if (budget.category) match.category = budget.category;
  if (budget.scope === "personal" && userId)
    match["participants.userId"] = userId;
  const rows = await Expense.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$amountMinor" } } },
  ]);
  const spentMinor = rows[0]?.total ?? 0;
  const usage = calculateBudgetUsage(
    budget.amountMinor,
    spentMinor,
    new Date(),
    end,
  );
  const daysElapsed = Math.max(
    1,
    Math.ceil((Date.now() - start.getTime()) / 86_400_000),
  );
  const projectedSpendMinor =
    usage.daysRemaining > 0
      ? Math.round((spentMinor / daysElapsed) * (daysElapsed + usage.daysRemaining))
      : spentMinor;
  const thresholds = [...(budget.alertThresholds ?? [50, 75, 90, 100])].sort(
    (a, b) => a - b,
  );
  const crossedThreshold =
    thresholds.filter((threshold) => usage.percentageUsed >= threshold).at(-1) ??
    null;
  return {
    budget,
    ...usage,
    projectedSpendMinor,
    crossedThreshold,
    nearLimit: usage.percentageUsed >= 75 && usage.percentageUsed < 100,
  };
}

export async function listBudgetUsage(filter: Record<string, unknown>, userId?: string) {
  const budgets = await Budget.find(filter).sort({ month: -1, scope: 1 }).lean();
  return Promise.all(budgets.map((budget) => budgetUsageFor(budget, userId)));
}
