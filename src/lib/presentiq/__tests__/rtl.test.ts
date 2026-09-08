import { describe, it, expect } from "vitest";
import { loadBrandContext } from "../brand/governance";
import { validateSlideRtl, normaliseArabicPunctuation } from "../rtl/validate";

describe("rtl/validate", () => {
  const ctx = loadBrandContext(null, "enterprise_boardroom", "bilingual");

  it("returns 100 when RTL not required", () => {
    const en = loadBrandContext(null, "corporate_boardroom", "en");
    const r = validateSlideRtl({ slide_number: 1, content_json: { kind: "bullets", bullets: [] } }, en);
    expect(r.score).toBe(100);
  });

  it("flags missing Arabic title", () => {
    const r = validateSlideRtl(
      {
        slide_number: 1,
        title_en: "Decision Required",
        content_json: { kind: "decision", recommendation: "Approve", rationale: [] },
      },
      ctx,
    );
    expect(r.findings.some((f) => f.rule === "missing_arabic_title")).toBe(true);
  });

  it("normalises ASCII punctuation in Arabic runs", () => {
    expect(normaliseArabicPunctuation("هل توافق؟").endsWith("؟")).toBe(true);
    expect(normaliseArabicPunctuation("هل، توافق؟")).toContain("،");
    expect(normaliseArabicPunctuation("hello, world")).toBe("hello, world");
  });
});
