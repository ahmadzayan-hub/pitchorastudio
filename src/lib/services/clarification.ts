import { generateJson } from "@/lib/llm/ollama";
import { GAP_ANALYSIS, QUESTION_GENERATION } from "@/lib/llm/prompts";
import { env } from "@/lib/env";

export interface Gap {
  slot: string;
  why: string;
}

export interface ClarificationQuestion {
  slot: string;
  question: string;
  rationale: string;
  required: boolean;
}

const RULE_BASED_GAPS: Array<{ slot: string; missing: (p: string) => boolean; why: string }> = [
  {
    slot: "audience",
    missing: (p) => !/audience|reader|user|customer|developer|student/i.test(p),
    why: "Knowing the target audience changes tone, depth, and vocabulary."
  },
  {
    slot: "format",
    missing: (p) => !/json|markdown|table|bullet|outline|essay|email|code|list/i.test(p),
    why: "Output format prevents the model from guessing structure."
  },
  {
    slot: "constraints",
    missing: (p) => !/limit|max|min|word|tokens|character|under|less than|no more/i.test(p),
    why: "Length and content constraints prevent over- or under-generation."
  },
  {
    slot: "success_criteria",
    missing: (p) => !/success|criteria|done when|good if|measure|metric/i.test(p),
    why: "Defining 'good' lets the model self-check before answering."
  }
];

/** Pure helper exposed for testing — returns rule-based gaps without calling the LLM. */
export function ruleBasedGaps(rawPrompt: string): Gap[] {
  return RULE_BASED_GAPS.filter((r) => r.missing(rawPrompt)).map((r) => ({
    slot: r.slot,
    why: r.why
  }));
}

/** Combine rule-based heuristics with an LLM gap analysis. */
export async function findGaps(rawPrompt: string, intent: string): Promise<Gap[]> {
  const heuristic: Gap[] = ruleBasedGaps(rawPrompt);

  const llm = await generateJson<{ gaps: Gap[] }>(
    `INTENT: ${intent}\nRAW PROMPT:\n"""\n${rawPrompt}\n"""`,
    { system: GAP_ANALYSIS, model: env.ollamaReasoning, temperature: 0.2 }
  );

  const llmGaps = "gaps" in llm && Array.isArray(llm.gaps) ? llm.gaps : [];

  const seen = new Set<string>();
  const merged: Gap[] = [];
  for (const g of [...heuristic, ...llmGaps]) {
    const key = g.slot.toLowerCase().trim();
    if (!seen.has(key) && g.slot && g.why) {
      seen.add(key);
      merged.push({ slot: g.slot, why: g.why });
    }
  }
  return merged.slice(0, 6);
}

/** Turn gaps into user-facing clarification questions. */
export async function generateQuestions(
  rawPrompt: string,
  intent: string,
  gaps: Gap[]
): Promise<ClarificationQuestion[]> {
  if (gaps.length === 0) return [];
  const result = await generateJson<{ questions: ClarificationQuestion[] }>(
    `INTENT: ${intent}\nRAW PROMPT:\n"""\n${rawPrompt}\n"""\nGAPS:\n${JSON.stringify(gaps)}`,
    { system: QUESTION_GENERATION, model: env.ollamaFast, temperature: 0.3 }
  );
  if ("questions" in result && Array.isArray(result.questions)) {
    return result.questions
      .filter((q) => q && typeof q.question === "string")
      .map((q, i) => ({
        slot: q.slot ?? gaps[i]?.slot ?? `slot_${i}`,
        question: q.question,
        rationale: q.rationale ?? "",
        required: q.required ?? true
      }));
  }
  // Fallback: synthesise basic questions from gaps
  return gaps.map((g) => ({
    slot: g.slot,
    question: `Could you tell me about ${g.slot.replace(/_/g, " ")}?`,
    rationale: g.why,
    required: true
  }));
}
