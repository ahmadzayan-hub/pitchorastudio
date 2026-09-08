import { describe, it, expect } from "vitest";
import { postFormatForModel } from "./formatter";

describe("postFormatForModel", () => {
  it("wraps Claude prompts in <task> when no XML tags present", () => {
    const out = postFormatForModel("Do the thing.", "claude");
    expect(out.startsWith("<task>")).toBe(true);
    expect(out.endsWith("</task>")).toBe(true);
  });

  it("leaves Claude prompts alone when they already use XML tags", () => {
    const input = "<context>x</context><task>y</task>";
    expect(postFormatForModel(input, "claude")).toBe(input);
  });

  it("converts Copilot prompts to comment style", () => {
    const out = postFormatForModel("write a function\nthat sorts", "copilot");
    expect(out.startsWith("// Intent:")).toBe(true);
    expect(out).toContain("// write a function");
    expect(out).toContain("// that sorts");
  });

  it("returns ChatGPT and generic prompts unchanged", () => {
    expect(postFormatForModel("hello", "chatgpt")).toBe("hello");
    expect(postFormatForModel("hello", "generic")).toBe("hello");
  });
});
