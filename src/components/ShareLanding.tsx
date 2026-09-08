"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * Forwards an inbound Web Share Target invocation into the workspace.
 *
 * Stuffs the shared text into sessionStorage under the same key the
 * /templates "starter" flow uses, then redirects. The workspace already
 * knows how to hydrate from `po_starter`, so we get a unified entry point
 * with no extra wiring.
 */
export default function ShareLanding() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const title = params.get("title") ?? "";
    const text  = params.get("text")  ?? "";
    const url   = params.get("url")   ?? "";

    const combined = [title, text, url].filter(Boolean).join("\n").trim();
    if (combined && typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "po_starter",
          JSON.stringify({ text: combined, model: "generic" })
        );
      } catch {
        /* ignore storage quota / private mode */
      }
    }
    router.replace("/workspace");
  }, [params, router]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 text-center">
      <div className="card animate-pulse">
        <p className="text-sm text-slate-500">Opening workspace…</p>
      </div>
    </div>
  );
}
