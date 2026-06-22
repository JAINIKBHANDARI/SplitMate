import { describe, expect, it } from "vitest";
import { calculateSplit, suggestSettlements } from "@splitmate/shared";
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
});
