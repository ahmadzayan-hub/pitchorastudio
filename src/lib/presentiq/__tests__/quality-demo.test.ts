import { describe, expect, it } from "vitest";
import { scoreDeck } from "../quality/score";
import { loadBrandContext } from "../brand/governance";
import { buildDemoBlueprint, buildDemoEvidence, buildDemoSlides } from "../demo/blueprint";

describe("quality/score — full demo deck", () => {
  it("hits boardroom-ready (≥95) for the canned demo deck", () => {
    const blueprint = buildDemoBlueprint({
      title: "Q3 Operations Review",
      audience: "Board",
      objective: "Approve Option B",
      decision_required: "Approve Option B",
      target_slide_count: 12,
      language_mode: "bilingual",
    });
    const slides = buildDemoSlides({
      title: "Q3 Operations Review",
      language_mode: "bilingual",
      blueprint,
    });
    const ctx = loadBrandContext(null, "corporate_boardroom", "bilingual");
    const evidence = buildDemoEvidence();

    const report = scoreDeck({
      slides,
      ctx,
      evidence: evidence as any,
      templateCompliance: 98,
    });

    const s = report.scores;
    // The whole point of the upgrade — demo deck is "boardroom ready".
    expect(s.boardroom_readiness).toBeGreaterThanOrEqual(95);
    expect(s.evidence_integrity).toBeGreaterThanOrEqual(85);
    expect(s.visual_quality).toBeGreaterThanOrEqual(90);
    expect(s.executive_clarity).toBeGreaterThanOrEqual(85);
    expect(s.accessibility).toBeGreaterThanOrEqual(80);
    expect(s.hallucination_risk).toBeLessThanOrEqual(15);
  });
});
