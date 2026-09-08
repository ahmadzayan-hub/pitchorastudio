/**
 * Evidence classification — heuristic baseline.
 *
 * The Evidence Agent (LLM-driven) refines this. The heuristic baseline
 * runs first, gives every claim an initial classification + confidence,
 * and lets the agent upgrade or downgrade based on the source.
 */

import type { EvidenceClassification, EvidenceItem } from "../types";

const REQUIRES_INPUT_PATTERNS = [
  /\[input\s+required\]/i,
  /\b(tbd|tba|to\s+be\s+determined|to\s+be\s+confirmed|pending)\b/i,
];
const ESTIMATE_PATTERNS = [
  /(approx(?:imately)?|roughly|circa|c\.|about|around|nearly)/i,
  /^[~]/,
];
const ASSESSMENT_PATTERNS = [
  /(low|medium|high)\s+risk/i,
  /\b(likely|unlikely|probable)\b/i,
];

export function heuristicClassify(claim: string): {
  classification: EvidenceClassification;
  confidence: number;
} {
  if (REQUIRES_INPUT_PATTERNS.some((re) => re.test(claim))) {
    return { classification: "input_required", confidence: 1 };
  }
  if (ESTIMATE_PATTERNS.some((re) => re.test(claim))) {
    return { classification: "estimate", confidence: 0.65 };
  }
  if (ASSESSMENT_PATTERNS.some((re) => re.test(claim))) {
    return { classification: "professional_assessment", confidence: 0.7 };
  }
  // contains a hard number/date -> prefer fact unless estimator
  if (/\d/.test(claim)) {
    return { classification: "fact", confidence: 0.85 };
  }
  return { classification: "ai_interpretation", confidence: 0.6 };
}

/**
 * Build EvidenceItem records from extracted text + a list of seed claims.
 * The seed claims come from the Evidence Agent — this is the deterministic
 * post-processor that ensures every item carries a classification.
 */
export function toEvidenceItems(
  projectId: string,
  sourceFileId: string | undefined,
  rawClaims: { claim: string; value?: string; source_reference?: any; topic_tags?: string[] }[],
): Omit<EvidenceItem, "id">[] {
  return rawClaims.map((rc) => {
    const cls = heuristicClassify(rc.claim);
    return {
      project_id: projectId,
      source_file_id: sourceFileId,
      claim: rc.claim,
      value: rc.value,
      classification: cls.classification,
      confidence: cls.confidence,
      source_reference: rc.source_reference ?? {},
      topic_tags: rc.topic_tags ?? [],
    };
  });
}
