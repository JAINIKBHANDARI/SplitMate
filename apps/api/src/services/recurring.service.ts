import { calculateRecurringOccurrence, calculateSplit } from "@splitmate/shared";
import { Expense } from "../models/Expense.js";
import { RecurringExpense } from "../models/RecurringExpense.js";
import { recordActivity } from "./activity.service.js";
import { notifyGroup } from "./notification.service.js";

const occurrenceKey = (ruleId: string, date: Date) =>
  `${ruleId}:${date.toISOString().slice(0, 10)}`;

export async function generateDueRecurringExpenses(now = new Date()) {
  const rules = await RecurringExpense.find({
    status: "active",
    nextOccurrenceDate: { $lte: now },
    $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }],
  });
  const summary = { checked: rules.length, created: 0, skipped: 0 };
  for (const rule of rules) {
    const dueDate = new Date(rule.nextOccurrenceDate);
    const key = occurrenceKey(String(rule._id), dueDate);
    const exists = await Expense.exists({
      recurringExpenseId: rule._id,
      occurrenceKey: key,
    });
    if (!exists) {
      const participants = calculateSplit(
        rule.amountMinor,
        rule.splitType as any,
        rule.participants.map((participant: any) => ({
          userId: String(participant.userId),
          included: participant.included,
          shareMinor: participant.shareMinor,
          percentage: participant.percentage,
          weight: participant.weight,
        })),
      );
      const expense = await Expense.create({
        groupId: rule.groupId,
        title: rule.title,
        amountMinor: rule.amountMinor,
        currency: rule.currency,
        category: rule.category,
        paidBy: rule.paidBy,
        splitType: rule.splitType,
        participants,
        expenseDate: dueDate,
        notes: rule.notes,
        source: "recurring",
        recurringExpenseId: rule._id,
        occurrenceDate: dueDate,
        occurrenceKey: key,
        createdBy: rule.createdBy,
        updatedBy: rule.updatedBy,
      });
      await recordActivity(
        String(rule.groupId),
        String(rule.createdBy),
        "recurring.generated",
        `Generated ${rule.title}`,
        { recurringExpenseId: String(rule._id), expenseId: String(expense._id) },
      );
      await notifyGroup(String(rule.groupId), {
        type: "recurring.generated",
        title: "Recurring expense added",
        body: `${rule.title} was added automatically.`,
        href: `/app/groups/${rule.groupId}/expenses`,
      });
      summary.created++;
    } else summary.skipped++;
    rule.nextOccurrenceDate = calculateRecurringOccurrence(
      dueDate,
      rule.frequency as any,
      rule.interval,
    );
    await rule.save();
  }
  console.info("Recurring expense generation", summary);
  return summary;
}
