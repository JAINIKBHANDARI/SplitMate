import { describe, expect, it } from "vitest";
import { money } from "../lib/format";
describe("money formatter", () => {
  it("formats minor units without floating point drift", () =>
    expect(money(12345, "INR")).toContain("123.45"));
});
