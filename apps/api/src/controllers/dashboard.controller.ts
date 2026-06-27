import { Expense } from "../models/Expense.js";
import { Group } from "../models/Group.js";
import { Membership } from "../models/Membership.js";
import { Settlement } from "../models/Settlement.js";
import { Activity } from "../models/Activity.js";
import { RecurringExpense } from "../models/RecurringExpense.js";
import { Budget } from "../models/Budget.js";
import { asyncHandler } from "../lib/errors.js";
import { ok } from "../lib/http.js";
import { calculateGroupBalances } from "../services/balance.service.js";
import { listBudgetUsage } from "../services/budget.service.js";

export const dashboard = asyncHandler(async (req, res) => {
  const memberships = await Membership.find({
    userId: req.auth!.userId,
    status: "active",
  }).lean();
  const groupIds = memberships.map((membership) => membership.groupId);
  const month = new Date().toISOString().slice(0, 7);
  const [groups, expenses, settlements, activity, category, monthly, recurringDue] =
    await Promise.all([
      Group.find({ _id: { $in: groupIds }, archived: false }).lean(),
      Expense.find({
        groupId: { $in: groupIds },
        deletedAt: { $exists: false },
      })
        .populate("groupId", "name cover")
        .populate("paidBy", "name")
        .sort({ expenseDate: -1 })
        .limit(8),
      Settlement.find({ groupId: { $in: groupIds } })
        .populate("fromUserId toUserId", "name")
        .sort({ settledAt: -1 })
        .limit(6),
      Activity.find({ groupId: { $in: groupIds } })
        .populate("actorId", "name avatarColor")
        .sort({ createdAt: -1 })
        .limit(8),
      Expense.aggregate([
        {
          $match: { groupId: { $in: groupIds }, deletedAt: { $exists: false } },
        },
        { $group: { _id: "$category", amountMinor: { $sum: "$amountMinor" } } },
        { $sort: { amountMinor: -1 } },
      ]),
      Expense.aggregate([
        {
          $match: {
            groupId: { $in: groupIds },
            deletedAt: { $exists: false },
            expenseDate: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)),
            },
          },
        },
        {
          $group: {
            _id: {
              y: { $year: "$expenseDate" },
              m: { $month: "$expenseDate" },
            },
            amountMinor: { $sum: "$amountMinor" },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1 } },
      ]),
      RecurringExpense.find({
        groupId: { $in: groupIds },
        status: "active",
        nextOccurrenceDate: {
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })
        .populate("groupId", "name cover")
        .sort({ nextOccurrenceDate: 1 })
        .limit(6)
        .lean(),
    ]);
  const budgetStatus = await listBudgetUsage(
    {
      $or: [
        { groupId: { $in: groupIds }, month },
        { userId: req.auth!.userId, month },
      ],
    },
    req.auth!.userId,
  );
  const groupBalanceRows = await Promise.all(
    groups.map((group) => calculateGroupBalances(String(group._id))),
  );
  const own = groupBalanceRows.reduce(
    (sum, row) =>
      sum +
      (row.balances.find((balance) => balance.userId === req.auth!.userId)
        ?.amountMinor ?? 0),
    0,
  );
  const totalSpentMinor = expenses.reduce(
    (sum, expense) => sum + expense.amountMinor,
    0,
  );
  const yourPaidMinor = expenses
    .filter(
      (expense) =>
        String(expense.paidBy._id ?? expense.paidBy) === req.auth!.userId,
    )
    .reduce((sum, expense) => sum + expense.amountMinor, 0);
  const yourShareMinor = expenses.reduce(
    (sum, expense) =>
      sum +
      (expense.participants.find(
        (participant) => String(participant.userId) === req.auth!.userId,
      )?.shareMinor ?? 0),
    0,
  );
  ok(res, {
    summary: {
      totalSpentMinor,
      yourPaidMinor,
      yourShareMinor,
      youOweMinor: Math.max(0, -own),
      youAreOwedMinor: Math.max(0, own),
      activeGroups: groups.length,
    },
    recentExpenses: expenses,
    recentSettlements: settlements,
    recentActivity: activity,
    budgetStatus,
    recurringDue,
    category,
    monthly: monthly.map((row) => ({
      label: `${row._id.y}-${String(row._id.m).padStart(2, "0")}`,
      amountMinor: row.amountMinor,
    })),
    topGroups: await Promise.all(
      groups.map(async (group) => ({
        id: String(group._id),
        name: group.name,
        cover: group.cover,
        amountMinor:
          (
            await Expense.aggregate([
              { $match: { groupId: group._id, deletedAt: { $exists: false } } },
              { $group: { _id: null, total: { $sum: "$amountMinor" } } },
            ])
          )[0]?.total ?? 0,
      })),
    ),
  });
});
