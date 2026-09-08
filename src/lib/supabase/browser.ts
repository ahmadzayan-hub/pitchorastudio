"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, assertSupabaseEnv } from "@/lib/env";

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserSupabase() {
  if (!_client) {
    assertSupabaseEnv();
    _client = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  }
  return _client;
}
