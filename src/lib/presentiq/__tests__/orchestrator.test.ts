import { describe, it, expect } from "vitest";
import { Orchestrator, MockProvider, loadBrandContext, MemoryAiCache } from "..";

describe("orchestrator (mock provider)", () => {
  it("produces a blueprint and a deck end-to-end", async () => {
    const provider = new MockProvider();
    const ctx = loadBrandContext(null, "enterprise_boardroom", "bilingual");
    const orch = new Orchestrator(provider, "org-1", new MemoryAiCache());
    const blueprint = await orch.runBlueprint({
      brief: {
        title: "Q3 Steering Committee",
        audience: "Executive Director",
        objective: "Approve Option 2",
        decision_required: "Approve",
        language_mode: "bilingual",
        presentation_mode: "enterprise_boardroom",
        target_slide_count: 8,
        target_duration_min: 25,
        confidentiality_level: "confidential",
      },
      evidence: [],
      ctx,
    });
    expect(blueprint.recommended_structure.length).toBeGreaterThan(0);

    const result = await orch.runDeck({
      brief: {
        title: "Q3",
        audience: "ED",
        objective: "Approve",
        decision_required: "Approve",
        language_mode: "bilingual",
        presentation_mode: "enterprise_boardroom",
        target_slide_count: 8,
        target_duration_min: 25,
        confidentiality_level: "confidential",
      },
      evidence: [],
      ctx,
      blueprint,
    });
    expect(result.slides.length).toBeGreaterThan(0);
    expect(result.quality.scores.boardroom_readiness).toBeGreaterThan(0);
  });
});
