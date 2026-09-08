"use client";

import { useState } from "react";
import { Button } from "@/components/presentiq/ui/Button";

export function BillingActions({ plan }: { plan: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(target: "pro" | "business", cycle: "monthly" | "annual") {
    setBusy("checkout"); setError(null);
    try {
      const res = await fetch("/api/presentiq/billing/create-checkout-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: target, cycle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "checkout_failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function portal() {
    setBusy("portal"); setError(null);
    try {
      const res = await fetch("/api/presentiq/billing/customer-portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "portal_failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div>}
      {plan === "trial" || plan === "pro" ? (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => checkout("pro", "monthly")} disabled={busy !== null}>Upgrade to Pro · monthly</Button>
          <Button variant="secondary" onClick={() => checkout("pro", "annual")} disabled={busy !== null}>Pro · annual</Button>
          <Button variant="secondary" onClick={() => checkout("business", "monthly")} disabled={busy !== null}>Business · monthly</Button>
        </div>
      ) : (
        <Button onClick={portal} disabled={busy !== null}>{busy === "portal" ? "Opening…" : "Manage subscription"}</Button>
      )}
    </div>
  );
}
