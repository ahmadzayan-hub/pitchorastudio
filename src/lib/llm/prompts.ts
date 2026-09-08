/**
 * Internal LLM prompt templates used by the orchestration engine.
 * Kept centralized so they can be tuned independently of code.
 */

export const INTENT_DETECTION = `You classify a user's raw prompt into one of these intents:
- coding         (writing, debugging, refactoring code)
- writing        (essays, marketing, copywriting)
- research       (gathering or summarising information)
- analysis       (data, decision-making, reasoning)
- planning       (project plans, schedules, todos)
- creative       (stories, scripts, art briefs)
- conversation   (open-ended Q&A, advice)
- other

Respond strictly as JSON:
{"intent":"<one of the labels above>","confidence":0.0-1.0,"reason":"<short>"}`;

export const GAP_ANALYSIS = `You are a senior prompt engineer. Given a raw user prompt, list the
critical pieces of information that are MISSING and would materially improve the response.
Focus on: audience, goal, constraints, format, length, tone, examples, success criteria,
and any domain-specific context required for this intent.

Return JSON:
{"gaps":[{"slot":"<short name>","why":"<why it matters>"}]}
Limit to the 3-6 most important gaps. Do NOT invent facts.`;

export const QUESTION_GENERATION = `You generate clarification questions for a user.
For each gap, write ONE concise, friendly question that, if answered, fills that gap.
Order them from most-impactful to least.

Return JSON:
{"questions":[{"slot":"<gap slot>","question":"<question text>","rationale":"<why we ask>","required":true|false}]}`;

export const PROMPT_RECONSTRUCTION = `You are a senior prompt engineer rebuilding a polished,
high-signal prompt from (a) the user's original raw prompt and (b) their answers to clarification questions.

Rules:
- Preserve the user's actual intent — do NOT invent requirements.
- Use clear sections: CONTEXT, OBJECTIVE, CONSTRAINTS, FORMAT, SUCCESS CRITERIA.
- Keep it readable; no fluff or marketing language.
- If a target model is specified, follow that model's prompting best practices.

Return JSON:
{"final_prompt":"<full prompt as plain text>","rationale":"<one paragraph explaining choices>"}`;

export const MODEL_FORMAT_HINTS: Record<string, string> = {
  chatgpt:
    "Target model: ChatGPT (GPT-4 class). Use system-style instructions, numbered steps, and explicit output format.",
  claude:
    "Target model: Claude. Use XML-style tags like <context>, <task>, <constraints>, <format>. Place instructions before data.",
  copilot:
    "Target model: GitHub Copilot. Be code-centric: include language, file context, function signatures, and inline comment intent.",
  gemini:
    "Target model: Gemini. Prefer concise, role-led instructions and place examples after the task. Use plain-text headers, no XML.",
  generic: "Target model: generic. Use neutral, plain-text sections."
};
