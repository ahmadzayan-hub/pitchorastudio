import { describe, it, expect } from "vitest";
import { ruleBasedGaps } from "./clarification";

describe("ruleBasedGaps", () => {
  it("flags all four gaps for a vague prompt", () => {
    const gaps = ruleBasedGaps("hi");
    const slots = gaps.map((g) => g.slot);
    expect(slots).toEqual(["audience", "format", "constraints", "success_criteria"]);
  });

  it("does not flag audience when reader is mentioned", () => {
    const gaps = ruleBasedGaps("write for a junior developer");
    expect(gaps.map((g) => g.slot)).not.toContain("audience");
  });

  it("does not flag format when JSON is mentioned", () => {
    const gaps = ruleBasedGaps("respond in JSON");
    expect(gaps.map((g) => g.slot)).not.toContain("format");
  });

  it("does not flag constraints when length limits are present", () => {
    const gaps = ruleBasedGaps("under 100 words");
    expect(gaps.map((g) => g.slot)).not.toContain("constraints");
  });

  it("does not flag success_criteria when measure is mentioned", () => {
    const gaps = ruleBasedGaps("define success metric clearly");
    expect(gaps.map((g) => g.slot)).not.toContain("success_criteria");
  });

  it("returns no gaps for a fully specified prompt", () => {
    const gaps = ruleBasedGaps(
      "Write JSON for a junior developer audience under 100 words. Success metric: passes the schema."
    );
    expect(gaps).toEqual([]);
  });
});
