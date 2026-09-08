/**
 * PresentIQ — shared types.
 *
 * Single source of truth used by:
 *   - API route handlers (validation via zod schemas re-exported below)
 *   - AI agents (input/output contracts)
 *   - PPTX renderer (slide model)
 *   - UI (form state, props)
 */

import { z } from "zod";

// ---------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------

export const PresentationModes = [
  "corporate_boardroom",
  "government_boardroom",
  "enterprise_boardroom",
  "consulting_partner",
  "sales_pitch",
  "project_steering",
  "technical_to_executive",
  "strategy_deck",
  "kpi_dashboard",
  "training",
  "investor_business_case",
  "tender_proposal",
] as const;
export type PresentationMode = (typeof PresentationModes)[number];

export const LanguageModes = ["en", "ar", "bilingual"] as const;
export type LanguageMode = (typeof LanguageModes)[number];

export const ConfidentialityLevels = [
  "public",
  "internal",
  "confidential",
  "strictly_confidential",
] as const;
export type ConfidentialityLevel = (typeof ConfidentialityLevels)[number];

export const EvidenceClassifications = [
  "fact",
  "user_input",
  "ai_interpretation",
  "professional_assessment",
  "estimate",
  "input_required",
] as const;
export type EvidenceClassification = (typeof EvidenceClassifications)[number];

export const ProjectStatuses = [
  "draft",
  "ingesting",
  "blueprint_ready",
  "generating",
  "ready",
  "approved",
  "exported",
] as const;
export type ProjectStatus = (typeof ProjectStatuses)[number];

export const Roles = ["owner", "admin", "editor", "reviewer", "viewer"] as const;
export type Role = (typeof Roles)[number];

export const Plans = ["trial", "pro", "business", "enterprise", "gov_private"] as const;
export type Plan = (typeof Plans)[number];

// ---------------------------------------------------------------------
// Brief
// ---------------------------------------------------------------------

export const BriefSchema = z.object({
  title: z.string().min(2).max(200),
  topic: z.string().max(500).optional(),
  audience: z.string().max(500).optional(),
  objective: z.string().max(1000).optional(),
  decision_required: z.string().max(500).optional(),
  language_mode: z.enum(LanguageModes),
  presentation_mode: z.enum(PresentationModes),
  target_slide_count: z.number().int().min(3).max(60).default(14),
  target_duration_min: z.number().int().min(5).max(180).default(25),
  confidentiality_level: z.enum(ConfidentialityLevels).default("internal"),
  brand_kit_id: z.string().uuid().optional(),
});
export type Brief = z.infer<typeof BriefSchema>;

// ---------------------------------------------------------------------
// Brand rules
// ---------------------------------------------------------------------

export type BrandRulesContext = {
  identity: {
    org_name: string;
    logos: { primary?: string; mono?: string; ar?: string };
  };
  palette: {
    primary: string;
    secondary: string;
    accent: string[];
    background: string;
    surface: string;
    foreground: string;
  };
  typography: {
    en_primary: string;
    en_fallback: string[];
    ar_primary: string;
    ar_fallback: string[];
    title_size_pt: [number, number];
    body_size_pt: [number, number];
    line_height: number;
  };
  layout: {
    logo_placement: "top_right" | "top_left" | "balanced_center";
    safe_margins_in: number;
    max_words_per_slide: number;
    max_bullets_per_slide: number;
    slide_density: "low" | "medium" | "high";
  };
  charts: {
    palette: string[];
    grid: "minimal" | "standard";
    label_size_pt: number;
  };
  iconography: {
    style: "line" | "duotone" | "filled";
  };
  language: {
    tone: "formal_corporate" | "government_executive" | "consulting_partner";
    forbidden_phrases: string[];
    approved_terminology: { en: string; ar: string }[];
    arabic_required: boolean;
    rtl_required: boolean;
  };
  governance: {
    require_decision_slide: boolean;
    forbid_thank_you_slide: boolean;
    forbid_questions_slide: boolean;
    require_executive_summary: boolean;
    require_recommendation_slide: boolean;
    require_next_steps_slide: boolean;
  };
};

// ---------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------

export type EvidenceItem = {
  id: string;
  project_id: string;
  source_file_id?: string;
  claim: string;
  value?: string;
  classification: EvidenceClassification;
  confidence: number;
  source_reference?: { file_id?: string; page?: number; span?: [number, number] };
  topic_tags?: string[];
};

// ---------------------------------------------------------------------
// Slide model (shared by storyboard, editor, renderer)
// ---------------------------------------------------------------------

export type ChartSpec = {
  kind: "column" | "stackedColumn" | "bar" | "line" | "area" | "pie" | "doughnut";
  title?: string;
  categories: string[];
  series: { name: string; values: number[] }[];
  showLegend?: boolean;
  showLabels?: boolean;
};

export type SlideModel =
  | { kind: "cover"; title: string; subtitle?: string; date?: string }
  | { kind: "exec_summary"; bullets: string[] }
  | { kind: "decision"; recommendation: string; rationale: string[] }
  | { kind: "kpi"; cards: { label: string; value: string; delta?: string }[] }
  | {
      kind: "timeline";
      milestones: { date: string; label: string; status?: "done" | "now" | "next" }[];
    }
  | { kind: "process"; steps: { label: string; description?: string }[] }
  | { kind: "matrix"; rows: string[]; cols: string[]; cells: string[][] }
  | {
      kind: "risk_heatmap";
      risks: { name: string; likelihood: 1 | 2 | 3; impact: 1 | 2 | 3 }[];
    }
  | { kind: "before_after"; before: string[]; after: string[] }
  | { kind: "chart"; spec: ChartSpec }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | {
      kind: "stakeholder_map";
      quadrants: {
        high_high: string[];
        high_low: string[];
        low_high: string[];
        low_low: string[];
      };
    }
  | {
      kind: "next_steps";
      actions: { owner: string; due: string; action: string }[];
    }
  | { kind: "bullets"; bullets: string[] }
  | { kind: "bilingual"; en: SlideModel; ar: SlideModel };

export type Slide = {
  id?: string;
  slide_number: number;
  title_en?: string;
  title_ar?: string;
  purpose?: string;
  key_message_en?: string;
  key_message_ar?: string;
  content_json: SlideModel;
  visual_json?: { layout?: string; palette?: string[]; iconography?: string };
  speaker_notes_en?: string;
  speaker_notes_ar?: string;
  animation_plan?: { entrance?: "none" | "fade" | "rise"; emphasis?: string[] };
  evidence_refs?: string[];
  quality_scores?: Record<string, number>;
  status?: "generated" | "revised" | "approved" | "locked";
};

// ---------------------------------------------------------------------
// Blueprint
// ---------------------------------------------------------------------

export type Blueprint = {
  objective: string;
  audience_logic: string;
  key_message: string;
  storyline: string[];
  recommended_structure: { slide_number: number; title: string; purpose: string }[];
  missing_data: string[];
};

// ---------------------------------------------------------------------
// Quality scores
// ---------------------------------------------------------------------

export const QualityDimensions = [
  "boardroom_readiness",
  "brand_compliance",
  "evidence_integrity",
  "rtl",
  "slide_simplicity",
  "visual_quality",
  "executive_clarity",
  "accessibility",
  "hallucination_risk",
  "template_compliance",
] as const;
export type QualityDimension = (typeof QualityDimensions)[number];
export type QualityReport = {
  scores: Record<QualityDimension, number>;
  findings: { dimension: QualityDimension; severity: "info" | "warn" | "error"; message: string }[];
  recommendations: { dimension: QualityDimension; action: string }[];
};
