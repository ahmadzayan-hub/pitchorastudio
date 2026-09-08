"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/presentiq/ui/Card";
import { Button } from "@/components/presentiq/ui/Button";
import { Input, Label } from "@/components/presentiq/ui/Field";

export function BrandKitEditor({ kit }: { kit: any }) {
  const [colors, setColors] = useState(kit.colors ?? {});
  const [fonts, setFonts] = useState(kit.fonts ?? {});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logos, setLogos] = useState(kit.logos ?? []);
  const [tokens, setTokens] = useState(kit.design_tokens ?? null);

  async function save() {
    setBusy("save"); setError(null);
    try {
      const res = await fetch(`/api/presentiq/brand-kits/${kit.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ colors, fonts }),
      });
      if (!res.ok) throw new Error("save_failed");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy("logo"); setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("locale", "en");
      const res = await fetch(`/api/presentiq/brand-kits/${kit.id}/upload-logo`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "upload_failed");
      setLogos((prev: any[]) => [...prev, data.logo]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function uploadTemplate(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy("template"); setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/presentiq/brand-kits/${kit.id}/upload-template`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "upload_failed");
      // Run extraction
      const res2 = await fetch(`/api/presentiq/brand-kits/${kit.id}/extract-tokens`, { method: "POST" });
      const data2 = await res2.json();
      if (!res2.ok) throw new Error(data2?.error?.message ?? "extract_failed");
      setTokens(data2.tokens);
      if (data2.brand_kit?.colors) setColors(data2.brand_kit.colors);
      if (data2.brand_kit?.fonts) setFonts(data2.brand_kit.fonts);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{kit.name}</h1>
          <p className="text-sm text-zinc-500 mt-1">Brand kit editor</p>
        </div>
        <Button onClick={save} disabled={busy !== null}>{busy === "save" ? "Saving…" : "Save"}</Button>
      </header>
      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Colors" subtitle="Hex values used by the renderer" />
          <CardBody className="space-y-2">
            {(["primary", "secondary", "background", "surface", "foreground"] as const).map((k) => (
              <div className="flex items-center gap-3" key={k}>
                <Label>{k}</Label>
                <Input value={(colors as any)[k] ?? ""} onChange={(e) => setColors({ ...colors, [k]: e.target.value })} placeholder="#000000" />
                <span className="inline-block w-6 h-6 rounded border border-zinc-200" style={{ backgroundColor: (colors as any)[k] ?? "#ffffff" }} />
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Fonts" subtitle="Embedded font names" />
          <CardBody className="space-y-2">
            {(["en_primary", "en_fallback", "ar_primary", "ar_fallback"] as const).map((k) => (
              <div className="flex items-center gap-3" key={k}>
                <Label>{k.replace("_", " ")}</Label>
                <Input value={(fonts as any)[k] ?? ""} onChange={(e) => setFonts({ ...fonts, [k]: e.target.value })} placeholder="Inter" />
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Logos" subtitle={`${logos.length} uploaded`} />
          <CardBody className="space-y-3">
            <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={uploadLogo} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-white" />
            <ul className="text-sm space-y-1">
              {logos.map((l: any, i: number) => (
                <li key={i} className="text-zinc-600">{l.locale} · {l.path}</li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Template Intelligence" subtitle="Upload a .pptx, extract tokens" />
          <CardBody className="space-y-3">
            <input type="file" accept=".pptx" onChange={uploadTemplate} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-white" />
            {tokens && (
              <pre className="bg-zinc-50 border border-zinc-200 rounded p-3 text-xs overflow-x-auto">{JSON.stringify(tokens, null, 2)}</pre>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
