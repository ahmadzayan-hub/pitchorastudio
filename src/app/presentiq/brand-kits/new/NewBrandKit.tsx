"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/presentiq/ui/Card";
import { Button } from "@/components/presentiq/ui/Button";
import { Input, Label } from "@/components/presentiq/ui/Field";

export function NewBrandKit() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [defaultKit, setDefaultKit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/presentiq/brand-kits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, is_default: defaultKit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "create_failed");
      router.push(`/presentiq/brand-kits/${data.brand_kit.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader title="New brand kit" />
      <CardBody className="space-y-4">
        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div>}
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Government · Boardroom" />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input type="checkbox" checked={defaultKit} onChange={(e) => setDefaultKit(e.target.checked)} />
          Set as organisation default
        </label>
        <Button onClick={submit} disabled={busy || !name}>{busy ? "Creating…" : "Create"}</Button>
      </CardBody>
    </Card>
  );
}
