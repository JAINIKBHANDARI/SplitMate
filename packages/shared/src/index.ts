export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export type SplitParticipant = {
  userId: string;
  included: boolean;
  shareMinor?: number;
  percentage?: number;
  weight?: number;
};

export type ComputedParticipant = SplitParticipant & { shareMinor: number };

export class SplitValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'SplitValidationError'; }
}

const distribute = (amountMinor: number, weighted: Array<{ userId: string; value: number; participant: SplitParticipant }>) => {
  const total = weighted.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) throw new SplitValidationError('At least one share is required.');
  const values = weighted.map((item) => {
    const raw = (amountMinor * item.value) / total;
    return { ...item, floor: Math.floor(raw), remainder: raw - Math.floor(raw) };
  }).sort((a, b) => b.remainder - a.remainder || a.userId.localeCompare(b.userId));
  let left = amountMinor - values.reduce((sum, item) => sum + item.floor, 0);
  return values.map((item) => ({ ...item.participant, shareMinor: item.floor + (left-- > 0 ? 1 : 0) }));
};

/** All calculations stay in minor units. Largest-remainder allocation always reconciles. */
export function calculateSplit(amountMinor: number, splitType: SplitType, participants: SplitParticipant[]): ComputedParticipant[] {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) throw new SplitValidationError('Amount must be a positive whole minor unit.');
  const included = participants.filter((participant) => participant.included);
  if (!included.length) throw new SplitValidationError('Choose at least one participant.');
  if (new Set(included.map((participant) => participant.userId)).size !== included.length) throw new SplitValidationError('Participants must be unique.');
  if (splitType === 'equal') return distribute(amountMinor, included.map((participant) => ({ userId: participant.userId, value: 1, participant })));
  if (splitType === 'shares') {
    if (included.some((participant) => !Number.isFinite(participant.weight) || (participant.weight ?? 0) <= 0)) throw new SplitValidationError('Every included member needs at least one share.');
    return distribute(amountMinor, included.map((participant) => ({ userId: participant.userId, value: participant.weight!, participant })));
  }
  if (splitType === 'percentage') {
    const percentage = included.reduce((sum, participant) => sum + (participant.percentage ?? 0), 0);
    if (Math.abs(percentage - 100) > 0.0001 || included.some((participant) => !Number.isFinite(participant.percentage) || (participant.percentage ?? 0) < 0)) throw new SplitValidationError('Percentages must total 100.');
    return distribute(amountMinor, included.map((participant) => ({ userId: participant.userId, value: participant.percentage!, participant })));
  }
  if (included.some((participant) => !Number.isSafeInteger(participant.shareMinor) || (participant.shareMinor ?? 0) < 0)) throw new SplitValidationError('Exact amounts must be whole minor units.');
  const total = included.reduce((sum, participant) => sum + participant.shareMinor!, 0);
  if (total !== amountMinor) throw new SplitValidationError('Exact amounts must equal the expense total.');
  return included.map((participant) => ({ ...participant, shareMinor: participant.shareMinor! }));
}

export type NetBalance = { userId: string; amountMinor: number };
export type SettlementSuggestion = { fromUserId: string; toUserId: string; amountMinor: number };

export function suggestSettlements(balances: NetBalance[]): SettlementSuggestion[] {
  const debtors = balances.filter((balance) => balance.amountMinor < 0).map((balance) => ({ ...balance, amountMinor: -balance.amountMinor })).sort((a, b) => b.amountMinor - a.amountMinor || a.userId.localeCompare(b.userId));
  const creditors = balances.filter((balance) => balance.amountMinor > 0).map((balance) => ({ ...balance })).sort((a, b) => b.amountMinor - a.amountMinor || a.userId.localeCompare(b.userId));
  const suggestions: SettlementSuggestion[] = [];
  let debtor = 0, creditor = 0;
  while (debtor < debtors.length && creditor < creditors.length) {
    const amountMinor = Math.min(debtors[debtor].amountMinor, creditors[creditor].amountMinor);
    if (amountMinor) suggestions.push({ fromUserId: debtors[debtor].userId, toUserId: creditors[creditor].userId, amountMinor });
    debtors[debtor].amountMinor -= amountMinor; creditors[creditor].amountMinor -= amountMinor;
    if (!debtors[debtor].amountMinor) debtor++; if (!creditors[creditor].amountMinor) creditor++;
  }
  return suggestions;
}

export const CATEGORIES = ['Food', 'Travel', 'Home', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Other'] as const;
export type ExpenseCategory = typeof CATEGORIES[number];
