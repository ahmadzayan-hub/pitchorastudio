/**
 * Pitchora — public re-exports.
 */

export * from "./types";
export { loadBrandContext, validateText, validatePalette, validateLayoutDensity } from "./brand/governance";
export { BUILT_IN_PRESETS, bilingualTerminology, corporateTerminology } from "./brand/presets";
export { scanForInjection, scanForFakeApproval, sanitiseForAgent } from "./security/guardrail";
export { validateSlideRtl, normaliseArabicPunctuation } from "./rtl/validate";
export { scoreDeck } from "./quality/score";
export { extractFromBuffer } from "./evidence/extractors";
export { heuristicClassify, toEvidenceItems } from "./evidence/classify";
export { Orchestrator, buildOrchestrator } from "./ai/orchestrator";
export { resolveProvider, MockProvider, AnthropicProvider } from "./ai/provider";
export { canonicalHash, MemoryAiCache } from "./ai/cache";
export { renderDeck } from "./pptx/render";
export { extractTemplate } from "./pptx/template-intelligence";
export { PLANS, getPlan } from "./stripe/plans";
export { getRequestContext, requireRole, isDemoContext } from "./auth/context";
export { getSupabase, getServiceRoleSupabase } from "./storage/supabase";
export { writeAudit } from "./storage/audit";
