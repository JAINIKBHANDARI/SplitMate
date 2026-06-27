import { suggestSettlements, type NetBalance } from "@splitmate/shared";
import { Expense } from "../models/Expense.js";
import { Settlement } from "../models/Settlement.js";
import { Membership } from "../models/Membership.js";

export async function calculateGroupBalances(groupId: string) {
  const memberships = await Membership.find({
    groupId,
    status: { $ne: "removed" },
    userId: { $exists: true },
  }).populate("userId", "name email avatarColor");
  const activeMembers = memberships.filter((member) => member.userId);
  const totals = new Map(
    activeMembers.map((member) => [
      String(member.userId!._id ?? member.userId!),
      0,
    ]),
  );
  const [expenses, settlements] = await Promise.all([
    Expense.find({ groupId, deletedAt: { $exists: false } }).lean(),
    Settlement.find({ groupId, status: { $in: ["completed", "confirmed"] } }).lean(),
  ]);
  for (const expense of expenses) {
    const payer = String(expense.paidBy);
    totals.set(payer, (totals.get(payer) ?? 0) + expense.amountMinor);
    for (const participant of expense.participants) {
      const id = String(participant.userId);
      totals.set(id, (totals.get(id) ?? 0) - participant.shareMinor);
    }
  }
  for (const settlement of settlements) {
    const from = String(settlement.fromUserId),
      to = String(settlement.toUserId);
    totals.set(from, (totals.get(from) ?? 0) + settlement.amountMinor);
    totals.set(to, (totals.get(to) ?? 0) - settlement.amountMinor);
  }
  const balances: NetBalance[] = [...totals].map(([userId, amountMinor]) => ({
    userId,
    amountMinor,
  }));
  const memberMap = new Map(
    activeMembers.map((member) => [
      String(member.userId!._id ?? member.userId!),
      member.userId!,
    ]),
  );
  return {
    balances: balances.map((balance) => ({
      ...balance,
      user: memberMap.get(balance.userId),
    })),
    suggestions: suggestSettlements(balances),
    totalSpentMinor: expenses.reduce(
      (sum, expense) => sum + expense.amountMinor,
      0,
    ),
  };
}
