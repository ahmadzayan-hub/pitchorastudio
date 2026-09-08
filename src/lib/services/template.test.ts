import { describe, it, expect } from "vitest";
import { renderSkeleton, normalizeTemplateBody } from "./template";

describe("renderSkeleton", () => {
  it("includes the original prompt and intent", () => {
    const out = renderSkeleton({
      rawPrompt: "make me a tweet",
      intent: "writing",
      qa: []
    });
    expect(out).toContain("# Intent: writing");
    expect(out).toContain("make me a tweet");
    expect(out).toContain("(no clarifications collected)");
  });

  it("renders Q&A pairs when provided", () => {
    const out = renderSkeleton({
      rawPrompt: "build a CRM",
      intent: "coding",
      qa: [{ question: "What stack?", answer: "Next.js + Supabase" }]
    });
    expect(out).toContain("- What stack?");
    expect(out).toContain("> Next.js + Supabase");
    expect(out).not.toContain("no clarifications collected");
  });

  it("uses template sections when supplied", () => {
    const out = renderSkeleton({
      rawPrompt: "x",
      intent: "writing",
      qa: [],
      template: {
        id: "t1",
        org_id: "o1",
        name: "Tweet",
        description: null,
        category: "writing",
        is_public: true,
        body: { sections: ["hook", "body", "cta"] }
      }
    });
    expect(out).toContain("# Template: Tweet");
    expect(out).toContain("- HOOK");
    expect(out).toContain("- BODY");
    expect(out).toContain("- CTA");
  });
});

describe("normalizeTemplateBody", () => {
  it("returns empty defaults for non-objects", () => {
    expect(normalizeTemplateBody(null)).toEqual({ sections: [], slots: [], defaults: {} });
    expect(normalizeTemplateBody("oops")).toEqual({ sections: [], slots: [], defaults: {} });
  });

  it("coerces section/slot arrays to strings", () => {
    const out = normalizeTemplateBody({ sections: [1, "two"], slots: [true], defaults: { a: "b" } });
    expect(out.sections).toEqual(["1", "two"]);
    expect(out.slots).toEqual(["true"]);
    expect(out.defaults).toEqual({ a: "b" });
  });
});
