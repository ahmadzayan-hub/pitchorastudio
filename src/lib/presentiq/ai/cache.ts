/**
 * AI cache — canonical-input hash → cached output.
 *
 * Backed by `pq_ai_cache`. Falls back to in-memory if no Supabase client.
 */

import crypto from "node:crypto";

export function canonicalHash(input: unknown, agent: string, version: string): string {
  const json = stableStringify(input);
  return crypto
    .createHash("sha256")
    .update(`${agent}@${version}|${json}`)
    .digest("hex");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

export interface AiCache {
  get(orgId: string, agent: string, version: string, hash: string): Promise<unknown | null>;
  set(orgId: string, agent: string, version: string, hash: string, output: unknown): Promise<void>;
}

export class MemoryAiCache implements AiCache {
  private store = new Map<string, { output: unknown; expiresAt: number }>();
  private key(orgId: string, agent: string, version: string, hash: string) {
    return `${orgId}:${agent}@${version}:${hash}`;
  }
  async get(orgId: string, agent: string, version: string, hash: string) {
    const k = this.key(orgId, agent, version, hash);
    const item = this.store.get(k);
    if (!item) return null;
    if (item.expiresAt < Date.now()) {
      this.store.delete(k);
      return null;
    }
    return item.output;
  }
  async set(orgId: string, agent: string, version: string, hash: string, output: unknown) {
    this.store.set(this.key(orgId, agent, version, hash), {
      output,
      expiresAt: Date.now() + 24 * 3600 * 1000,
    });
  }
}
