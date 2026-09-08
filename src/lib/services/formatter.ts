import { generateJson } from "@/lib/llm/ollama";
import { PROMPT_RECONSTRUCTION, MODEL_FORMAT_HINTS } from "@/lib/llm/prompts";
import { env } from "@/lib/env";
import type { TargetModel } from "@/lib/types";
import { renderSkeleton, type RenderInput } from "./template";

export interface FormatResult {
  final_prompt: string;
  rationale: string;
}

export async function reconstructPrompt(
  input: RenderInput,
  targetModel: TargetModel = "generic"
): Promise<FormatResult> {
  const skeleton = renderSkeleton(input);
  const hint = MODEL_FORMAT_HINTS[targetModel] ?? MODEL_FORMAT_HINTS.generic;

  const result = await generateJson<FormatResult>(
    `${hint}\n\nSKELETON:\n${skeleton}`,
    { system: PROMPT_RECONSTRUCTION, model: env.ollamaRewrite, temperature: 0.3 }
  );

  if ("final_prompt" in result && typeof result.final_prompt === "string") {
    return {
      final_prompt: result.final_prompt,
      rationale: result.rationale ?? ""
    };
  }
  // last-resort fallback so the user always gets *something* useful
  return {
    final_prompt: skeleton,
    rationale: "LLM reconstruction failed; returning the structured skeleton."
  };
}

/** Lightweight, per-model post-formatter for the final string. */
export function postFormatForModel(prompt: string, model: TargetModel): string {
  switch (model) {
    case "claude":
      // wrap sections in XML if not already
      if (!/<context>|<task>|<format>/i.test(prompt)) {
        return `<task>\n${prompt}\n</task>`;
      }
      return prompt;
    case "copilot":
      // Copilot prefers code-comment style intent at the top
      return `// Intent:\n// ${prompt.split("\n").join("\n// ")}\n`;
    case "chatgpt":
    case "generic":
    default:
      return prompt;
  }
}
