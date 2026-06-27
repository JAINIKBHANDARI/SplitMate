import { describe, expect, it } from "vitest";
import {
  calculateMemberBalances,
  calculateBudgetUsage,
  calculateRecurringOccurrence,
  calculateSplit,
  fromMinorUnits,
  suggestSettlements,
  toMinorUnits,
} from "@splitmate/shared";
describe("split and settlement engine", () => {
  it("reconciles awkward equal splits exactly", () => {
    const split = calculateSplit(100, "equal", [
      { userId: "a", included: true },
      { userId: "b", included: true },
      { userId: "c", included: true },
    ]);
    expect(split.reduce((sum, item) => sum + item.shareMinor, 0)).toBe(100);
  });
  it("minimizes transfers", () => {
    expect(
      suggestSettlements([
        { userId: "a", amountMinor: -70 },
        { userId: "b", amountMinor: -30 },
        { userId: "c", amountMinor: 100 },
      ]),
    ).toEqual([
      { fromUserId: "a", toUserId: "c", amountMinor: 70 },
      { fromUserId: "b", toUserId: "c", amountMinor: 30 },
    ]);
  });
  it("converts currency strings to exact minor units", () => {
    expect(toMinorUnits("100.50")).toBe(10050);
    expect(fromMinorUnits(10050)).toBe("100.50");
  });
  it("reconciles percentage splits exactly", () => {
    const split = calculateSplit(101, "percentage", [
      { userId: "a", included: true, percentage: 33.33 },
      { userId: "b", included: true, percentage: 33.33 },
      { userId: "c", included: true, percentage: 33.34 },
    ]);
    expect(split.reduce((sum, item) => sum + item.shareMinor, 0)).toBe(101);
  });
  it("accepts exact splits only when they reconcile", () => {
    expect(
      calculateSplit(500, "exact", [
        { userId: "a", included: true, shareMinor: 300 },
        { userId: "b", included: true, shareMinor: 200 },
      ]),
    ).toEqual([
      { userId: "a", included: true, shareMinor: 300 },
      { userId: "b", included: true, shareMinor: 200 },
    ]);
    expect(() =>
      calculateSplit(500, "exact", [
        { userId: "a", included: true, shareMinor: 300 },
        { userId: "b", included: true, shareMinor: 100 },
      ]),
    ).toThrow(/equal the expense total/i);
  });
  it("calculates weighted share splits deterministically", () => {
    expect(
      calculateSplit(100, "shares", [
        { userId: "b", included: true, weight: 1 },
        { userId: "a", included: true, weight: 2 },
      ]),
    ).toEqual([
      { userId: "a", included: true, weight: 2, shareMinor: 67 },
      { userId: "b", included: true, weight: 1, shareMinor: 33 },
    ]);
  });
  it("keeps group net balance at zero after settlements", () => {
    const balances = calculateMemberBalances(
      [
        {
          amountMinor: 3000,
          paidBy: "a",
          participants: [
            { userId: "a", shareMinor: 1000 },
            { userId: "b", shareMinor: 1000 },
            { userId: "c", shareMinor: 1000 },
          ],
        },
      ],
      [{ fromUserId: "b", toUserId: "a", amountMinor: 1000 }],
    );
    expect(balances.reduce((sum, item) => sum + item.amountMinor, 0)).toBe(0);
    expect(balances.find((item) => item.userId === "b")?.amountMinor).toBe(0);
  });
  it("calculates budget status and recurring dates", () => {
    expect(calculateBudgetUsage(10000, 7600).percentageUsed).toBe(76);
    const next = calculateRecurringOccurrence(
      new Date("2026-01-31"),
      "monthly",
      1,
    );
    expect(next.getMonth()).toBe(1);
    expect(next.getDate()).toBe(28);
  });
});
