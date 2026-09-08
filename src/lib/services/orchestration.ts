import { generateJson } from "@/lib/llm/ollama";
import { INTENT_DETECTION } from "@/lib/llm/prompts";
import { env } from "@/lib/env";

export interface IntentResult {
  intent: string;
  confidence: number;
  reason?: string;
}

/**
 * Prompt Orchestration Service.
 * Top-level entry: takes a raw prompt, returns detected intent.
 */
export async function detectIntent(rawPrompt: string): Promise<IntentResult> {
  const result = await generateJson<IntentResult>(
    `RAW PROMPT:\n"""\n${rawPrompt}\n"""\n\nClassify it.`,
    { system: INTENT_DETECTION, model: env.ollamaFast, temperature: 0.0 }
  );
  if ("intent" in result && typeof result.intent === "string") {
    return {
      intent: result.intent,
      confidence: typeof result.confidence === "number" ? result.confidence : 0.5,
      reason: result.reason
    };
  }
  return { intent: "other", confidence: 0.3 };
}
