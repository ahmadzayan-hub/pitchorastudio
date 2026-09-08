import type { Template, TemplateBody } from "@/lib/types";

export interface RenderInput {
  rawPrompt: string;
  intent: string;
  qa: Array<{ question: string; answer: string }>;
  template?: Template | null;
}

/** Render a structured prompt skeleton from a template + Q&A. */
export function renderSkeleton(input: RenderInput): string {
  const sections = input.template?.body?.sections ?? [
    "context",
    "objective",
    "constraints",
    "format",
    "success_criteria"
  ];

  const qaBlock = input.qa.length
    ? input.qa.map((p) => `- ${p.question}\n  > ${p.answer}`).join("\n")
    : "(no clarifications collected)";

  const lines: string[] = [];
  lines.push(`# Intent: ${input.intent}`);
  if (input.template) lines.push(`# Template: ${input.template.name}`);
  lines.push("");
  lines.push("## Original Request");
  lines.push(input.rawPrompt);
  lines.push("");
  lines.push("## Clarifications");
  lines.push(qaBlock);
  lines.push("");
  lines.push("## Sections to fill");
  for (const s of sections) lines.push(`- ${s.toUpperCase()}`);
  return lines.join("\n");
}

/** Validate template body shape; returns a normalised body. */
export function normalizeTemplateBody(body: unknown): TemplateBody {
  if (!body || typeof body !== "object") return { sections: [], slots: [], defaults: {} };
  const b = body as Partial<TemplateBody>;
  return {
    sections: Array.isArray(b.sections) ? b.sections.map(String) : [],
    slots: Array.isArray(b.slots) ? b.slots.map(String) : [],
    defaults: b.defaults && typeof b.defaults === "object" ? (b.defaults as Record<string, string>) : {}
  };
}
