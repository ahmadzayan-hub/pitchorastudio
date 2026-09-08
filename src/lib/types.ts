export type Role = "owner" | "admin" | "member";

export type SessionStatus = "intake" | "clarifying" | "ready" | "finalized";

export type TargetModel = "chatgpt" | "claude" | "copilot" | "gemini" | "generic";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  display_name: string | null;
  default_org_id: string | null;
}

export interface Template {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  category: string | null;
  body: TemplateBody;
  is_public: boolean;
}

export interface TemplateBody {
  sections?: string[];
  slots?: string[];
  defaults?: Record<string, string>;
}

export interface Session {
  id: string;
  org_id: string;
  user_id: string;
  raw_prompt: string;
  intent: string | null;
  intent_confidence: number | null;
  status: SessionStatus;
  target_model: TargetModel | null;
  template_id: string | null;
  metadata: Record<string, unknown>;
}

export interface Question {
  id: string;
  session_id: string;
  position: number;
  question: string;
  rationale: string | null;
  required: boolean;
}

export interface Answer {
  id: string;
  question_id: string;
  session_id: string;
  answer: string;
}

export interface PromptVersion {
  id: string;
  session_id: string;
  version: number;
  target_model: TargetModel | null;
  final_prompt: string;
  rationale: string | null;
}
