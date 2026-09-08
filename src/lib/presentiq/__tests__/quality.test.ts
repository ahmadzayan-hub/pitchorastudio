import { describe, it, expect } from "vitest";
import { scoreDeck } from "../quality/score";
import { loadBrandContext } from "../brand/governance";

describe("quality/score", () => {
  it("penalises fake approvals via hallucination_risk", () => {
    const ctx = loadBrandContext(null, "enterprise_boardroom", "bilingual");
    const report = scoreDeck({
      slides: [
        {
          slide_number: 1,
          title_en: "Approved by His Highness",
          key_message_en: "Officially approved",
          content_json: { kind: "bullets", bullets: [] },
        },
      ],
      ctx,
      evidence: [],
    });
    expect(report.scores.hallucination_risk).toBeGreaterThan(0);
  });

  it("rewards evidence-linked slides", () => {
    const ctx = loadBrandContext(null, "corporate_boardroom", "en");
    const r = scoreDeck({
      slides: [
        { slide_number: 1, title_en: "Q3 Status Decision Required", content_json: { kind: "decision", recommendation: "Approve", rationale: [] }, evidence_refs: ["e1"] },
        { slide_number: 2, title_en: "KPI", content_json: { kind: "kpi", cards: [{ label: "Uptime", value: "99.9 %" }] }, evidence_refs: ["e2"] },
      ],
      ctx,
      evidence: [],
    });
    expect(r.scores.evidence_integrity).toBeGreaterThanOrEqual(60);
  });
});
