// Read env without throwing — modules import this at build time on Vercel
// before runtime env vars are bound. Missing values surface as clear 500s
// from the API routes that actually need them, not as build failures.
//
// Supabase recently renamed the public client key from "anon" to
// "publishable". Both names work; we accept either.
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  ollamaReasoning: process.env.OLLAMA_MODEL_REASONING ?? "llama3",
  ollamaFast: process.env.OLLAMA_MODEL_FAST ?? "mistral",
  ollamaRewrite: process.env.OLLAMA_MODEL_REWRITE ?? "phi3",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  extensionApiKey: process.env.EXTENSION_API_KEY ?? ""
};

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function assertSupabaseEnv() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)"
    );
  }
}
