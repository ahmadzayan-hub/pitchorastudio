/**
 * Security Guardrail.
 *
 * Two roles:
 *   1. Pre-ingest: scan uploaded text for prompt-injection patterns. Block if detected.
 *   2. Pre-export: ensure no agent output contains forbidden tokens, confidential leakage,
 *      or fake approvals.
 */

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|earlier|prior)\s+(instructions|prompts|rules)/i,
  /you\s+are\s+now\s+(an?\s+)?(unrestricted|different|new)\s+(assistant|model|ai)/i,
  /disregard\s+(the\s+)?(system|developer)\s+(prompt|message|rules)/i,
  /(?:^|\n)\s*system\s*:/i,
  /(?:^|\n)\s*assistant\s*:/i,
  /<\s*tool[_-]?call[\s>]/i,
  /reveal\s+(your\s+)?(system|hidden|internal)\s+(prompt|instructions)/i,
  /(jailbreak|DAN\s+mode|developer\s+mode\s+enabled)/i,
  /export\s+all\s+(data|files|customer\s+data)/i,
  /delete\s+all\s+(?:.+\s+)?policies/i,
  // unicode tricks
  /[‪-‮⁦-⁩]/, // bidi overrides
  /[​-‏]/g,             // zero-width / RTL marks (also surface for review)
];

const FAKE_APPROVAL_PATTERNS: RegExp[] = [
  /approved\s+by\s+(his\s+highness|the\s+ceo|the\s+board)/i,
  /(officially|formally)\s+approved/i,
  /signed\s+off\s+by\s+/i,
];

export type GuardDecision =
  | { ok: true; warnings: string[] }
  | { ok: false; reason: string; matches: string[] };

export function scanForInjection(text: string): GuardDecision {
  if (!text) return { ok: true, warnings: [] };
  const matches: string[] = [];
  const warnings: string[] = [];

  for (const re of INJECTION_PATTERNS) {
    const m = text.match(re);
    if (m) matches.push(m[0]);
  }

  if (matches.length) {
    return {
      ok: false,
      reason: "prompt_injection_detected",
      matches: matches.slice(0, 10),
    };
  }
  return { ok: true, warnings };
}

export function scanForFakeApproval(text: string): GuardDecision {
  if (!text) return { ok: true, warnings: [] };
  const matches: string[] = [];
  for (const re of FAKE_APPROVAL_PATTERNS) {
    const m = text.match(re);
    if (m) matches.push(m[0]);
  }
  if (matches.length) {
    return { ok: false, reason: "fake_approval_detected", matches };
  }
  return { ok: true, warnings: [] };
}

/**
 * Strip control characters that are commonly used in prompt-injection
 * attempts but harmless in legitimate corporate documents.
 */
export function sanitiseForAgent(text: string): string {
  if (!text) return "";
  return text
    .replace(/[‪-‮⁦-⁩]/g, "") // bidi overrides
    .replace(/[​-‏]/g, "")              // zero-width / RTL marks
    .replace(/­/g, "")                       // soft hyphen
    .normalize("NFC");
}
