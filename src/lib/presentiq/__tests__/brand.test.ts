import { describe, it, expect } from "vitest";
import { loadBrandContext } from "../brand/governance";
import { bilingualTerminology } from "../brand/presets";

describe("brand/governance", () => {
  it("loads the Enterprise Sapphire boardroom preset", () => {
    const ctx = loadBrandContext(null, "enterprise_boardroom", "bilingual");
    // Sapphire + crimson enterprise palette.
    expect(ctx.palette.primary.toUpperCase()).toBe("#1A2E64");
    expect(ctx.palette.secondary.toUpperCase()).toBe("#D81E05");
    expect(ctx.language.arabic_required).toBe(true);
    expect(ctx.language.rtl_required).toBe(true);
    expect(ctx.language.approved_terminology.length).toBeGreaterThan(15);
  });

  it("locks the context (deep frozen)", () => {
    const ctx = loadBrandContext(null, "corporate_boardroom", "en");
    expect(() => {
      (ctx as any).palette.primary = "#000000";
    }).toThrow();
  });

  it("requires arabic for bilingual mode regardless of preset", () => {
    const ctx = loadBrandContext(null, "consulting_partner", "bilingual");
    expect(ctx.language.arabic_required).toBe(true);
    expect(ctx.language.rtl_required).toBe(true);
  });

  it("includes the full bilingual terminology table for the Enterprise Sapphire preset", () => {
    const ctx = loadBrandContext(null, "enterprise_boardroom", "ar");
    const en = new Set(ctx.language.approved_terminology.map((t) => t.en));
    for (const t of bilingualTerminology) {
      expect(en.has(t.en)).toBe(true);
    }
  });
});
