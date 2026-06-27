export type SplitType = "equal" | "exact" | "percentage" | "shares";

export type SplitParticipant = {
  userId: string;
  included: boolean;
  shareMinor?: number;
  percentage?: number;
  weight?: number;
};

export type ComputedParticipant = SplitParticipant & { shareMinor: number };

export class SplitValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SplitValidationError";
  }
}

export function toMinorUnits(value: string | number) {
  if (typeof value === "number" && !Number.isFinite(value))
    throw new SplitValidationError("Amount must be a valid number.");
  const raw = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw))
    throw new SplitValidationError("Amount can have at most two decimals.");
  const [major, minor = ""] = raw.split(".");
  const amount = Number(major) * 100 + Number(minor.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount <= 0)
    throw new SplitValidationError("Amount must be greater than zero.");
  return amount;
}

export function fromMinorUnits(amountMinor: number) {
  if (!Number.isSafeInteger(amountMinor))
    throw new SplitValidationError("Amount must be a whole minor unit.");
  return (amountMinor / 100).toFixed(2);
}

const distribute = (
  amountMinor: number,
  weighted: Array<{
    userId: string;
    value: number;
    participant: SplitParticipant;
  }>,
) => {
  const total = weighted.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0)
    throw new SplitValidationError("At least one share is required.");
  const values = weighted
    .map((item) => {
      const raw = (amountMinor * item.value) / total;
      return {
        ...item,
        floor: Math.floor(raw),
        remainder: raw - Math.floor(raw),
      };
    })
    .sort(
      (a, b) => b.remainder - a.remainder || a.userId.localeCompare(b.userId),
    );
  let left = amountMinor - values.reduce((sum, item) => sum + item.floor, 0);
  return values.map((item) => ({
    ...item.participant,
    shareMinor: item.floor + (left-- > 0 ? 1 : 0),
  }));
};

/** All calculations stay in minor units. Largest-remainder allocation always reconciles. */
export function calculateSplit(
  amountMinor: number,
  splitType: SplitType,
  participants: SplitParticipant[],
): ComputedParticipant[] {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0)
    throw new SplitValidationError(
      "Amount must be a positive whole minor unit.",
    );
  const included = participants.filter((participant) => participant.included);
  if (!included.length)
    throw new SplitValidationError("Choose at least one participant.");
  if (
    new Set(included.map((participant) => participant.userId)).size !==
    included.length
  )
    throw new SplitValidationError("Participants must be unique.");
  if (splitType === "equal")
    return distribute(
      amountMinor,
      included.map((participant) => ({
        userId: participant.userId,
        value: 1,
        participant,
      })),
    );
  if (splitType === "shares") {
    if (
      included.some(
        (participant) =>
          !Number.isFinite(participant.weight) ||
          (participant.weight ?? 0) <= 0,
      )
    )
      throw new SplitValidationError(
        "Every included member needs at least one share.",
      );
    return distribute(
      amountMinor,
      included.map((participant) => ({
        userId: participant.userId,
        value: participant.weight!,
        participant,
      })),
    );
  }
  if (splitType === "percentage") {
    const percentage = included.reduce(
      (sum, participant) => sum + (participant.percentage ?? 0),
      0,
    );
    if (
      Math.abs(percentage - 100) > 0.0001 ||
      included.some(
        (participant) =>
          !Number.isFinite(participant.percentage) ||
          (participant.percentage ?? 0) < 0,
      )
    )
      throw new SplitValidationError("Percentages must total 100.");
    return distribute(
      amountMinor,
      included.map((participant) => ({
        userId: participant.userId,
        value: participant.percentage!,
        participant,
      })),
    );
  }
  if (
    included.some(
      (participant) =>
        !Number.isSafeInteger(participant.shareMinor) ||
        (participant.shareMinor ?? 0) < 0,
    )
  )
    throw new SplitValidationError("Exact amounts must be whole minor units.");
  const total = included.reduce(
    (sum, participant) => sum + participant.shareMinor!,
    0,
  );
  if (total !== amountMinor)
    throw new SplitValidationError(
      "Exact amounts must equal the expense total.",
    );
  return included.map((participant) => ({
    ...participant,
    shareMinor: participant.shareMinor!,
  }));
}

export const splitEqually = (
  amountMinor: number,
  participants: SplitParticipant[],
) => calculateSplit(amountMinor, "equal", participants);

export const splitByExactAmounts = (
  amountMinor: number,
  participants: SplitParticipant[],
) => calculateSplit(amountMinor, "exact", participants);

export const splitByPercentages = (
  amountMinor: number,
  participants: SplitParticipant[],
) => calculateSplit(amountMinor, "percentage", participants);

export const splitByShares = (
  amountMinor: number,
  participants: SplitParticipant[],
) => calculateSplit(amountMinor, "shares", participants);

export type NetBalance = { userId: string; amountMinor: number };
export type SettlementSuggestion = {
  fromUserId: string;
  toUserId: string;
  amountMinor: number;
};

export function suggestSettlements(
  balances: NetBalance[],
): SettlementSuggestion[] {
  const debtors = balances
    .filter((balance) => balance.amountMinor < 0)
    .map((balance) => ({ ...balance, amountMinor: -balance.amountMinor }))
    .sort(
      (a, b) =>
        b.amountMinor - a.amountMinor || a.userId.localeCompare(b.userId),
    );
  const creditors = balances
    .filter((balance) => balance.amountMinor > 0)
    .map((balance) => ({ ...balance }))
    .sort(
      (a, b) =>
        b.amountMinor - a.amountMinor || a.userId.localeCompare(b.userId),
    );
  const suggestions: SettlementSuggestion[] = [];
  let debtor = 0,
    creditor = 0;
  while (debtor < debtors.length && creditor < creditors.length) {
    const amountMinor = Math.min(
      debtors[debtor].amountMinor,
      creditors[creditor].amountMinor,
    );
    if (amountMinor)
      suggestions.push({
        fromUserId: debtors[debtor].userId,
        toUserId: creditors[creditor].userId,
        amountMinor,
      });
    debtors[debtor].amountMinor -= amountMinor;
    creditors[creditor].amountMinor -= amountMinor;
    if (!debtors[debtor].amountMinor) debtor++;
    if (!creditors[creditor].amountMinor) creditor++;
  }
  return suggestions;
}

export const generateSettlementSuggestions = suggestSettlements;

export function calculateMemberBalances(
  expenses: Array<{
    amountMinor: number;
    paidBy: string;
    participants: Array<{ userId: string; shareMinor: number }>;
  }>,
  settlements: Array<{
    fromUserId: string;
    toUserId: string;
    amountMinor: number;
  }> = [],
) {
  const totals = new Map<string, number>();
  const bump = (userId: string, amountMinor: number) =>
    totals.set(userId, (totals.get(userId) ?? 0) + amountMinor);
  for (const expense of expenses) {
    bump(expense.paidBy, expense.amountMinor);
    for (const participant of expense.participants)
      bump(participant.userId, -participant.shareMinor);
  }
  for (const settlement of settlements) {
    bump(settlement.fromUserId, settlement.amountMinor);
    bump(settlement.toUserId, -settlement.amountMinor);
  }
  return [...totals]
    .map(([userId, amountMinor]) => ({ userId, amountMinor }))
    .sort((a, b) => a.userId.localeCompare(b.userId));
}

export function calculateUserSummary(
  userId: string,
  expenses: Array<{
    amountMinor: number;
    paidBy: string;
    participants: Array<{ userId: string; shareMinor: number }>;
  }>,
) {
  const totalSpentMinor = expenses.reduce(
    (sum, expense) => sum + expense.amountMinor,
    0,
  );
  const yourPaidMinor = expenses
    .filter((expense) => expense.paidBy === userId)
    .reduce((sum, expense) => sum + expense.amountMinor, 0);
  const yourShareMinor = expenses.reduce(
    (sum, expense) =>
      sum +
      (expense.participants.find((participant) => participant.userId === userId)
        ?.shareMinor ?? 0),
    0,
  );
  return {
    totalSpentMinor,
    yourPaidMinor,
    yourShareMinor,
    netMinor: yourPaidMinor - yourShareMinor,
  };
}

export function calculateBudgetUsage(
  amountMinor: number,
  spentMinor: number,
  now = new Date(),
  periodEnd?: Date,
) {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0)
    throw new SplitValidationError("Budget amount must be positive.");
  const remainingMinor = amountMinor - spentMinor;
  const percentageUsed = Math.round((spentMinor / amountMinor) * 1000) / 10;
  const daysRemaining = periodEnd
    ? Math.max(
        0,
        Math.ceil((periodEnd.getTime() - now.getTime()) / 86_400_000),
      )
    : 0;
  return {
    amountMinor,
    spentMinor,
    remainingMinor,
    percentageUsed,
    daysRemaining,
    isOverBudget: spentMinor > amountMinor,
  };
}

export function calculateRecurringOccurrence(
  date: Date,
  frequency: "weekly" | "monthly" | "custom",
  interval = 1,
) {
  const next = new Date(date);
  if (!Number.isInteger(interval) || interval < 1)
    throw new SplitValidationError("Recurring interval must be positive.");
  if (frequency === "weekly") next.setDate(next.getDate() + 7 * interval);
  else if (frequency === "monthly") {
    const originalDay = next.getDate();
    next.setDate(1);
    next.setMonth(next.getMonth() + interval);
    const lastDay = new Date(
      next.getFullYear(),
      next.getMonth() + 1,
      0,
    ).getDate();
    next.setDate(Math.min(originalDay, lastDay));
  }
  else next.setDate(next.getDate() + interval);
  return next;
}

export const CATEGORIES = [
  "Food",
  "Travel",
  "Home",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Health",
  "Other",
] as const;
export type ExpenseCategory = (typeof CATEGORIES)[number];
