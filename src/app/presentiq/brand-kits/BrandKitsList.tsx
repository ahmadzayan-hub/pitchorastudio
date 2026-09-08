"use client";

import Link from "next/link";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";

type Kit = {
  id: string;
  name: string;
  is_default?: boolean;
  preset?: string;
  colors?: Record<string, string>;
  logos?: { url: string }[];
};

export function BrandKitsList({ items }: { items: Kit[] }) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--pq-text)" }}>
          {t("bk.title")}
        </h1>
        <Link href="/presentiq/brand-kits/new" className="pq-btn pq-btn-primary">＋ {t("bk.new")}</Link>
      </header>

      {items.length === 0 ? (
        <Frame4D className="p-6">
          <div className="text-sm" style={{ color: "var(--pq-text-soft)" }}>{t("bk.empty")}</div>
        </Frame4D>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((k) => (
            <Frame4D key={k.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/presentiq/brand-kits/${k.id}`}
                  className="font-semibold hover:underline"
                  style={{ color: "var(--pq-text)" }}
                >
                  {k.name}
                </Link>
                {k.is_default && <span className="pq-pill pq-pill-strong">★</span>}
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                {Object.values(k.colors ?? {}).slice(0, 6).map((c, i) => (
                  <span
                    key={i}
                    className="h-5 w-5 rounded-md"
                    style={{ background: String(c), border: "1px solid rgba(66,87,34,0.22)" }}
                  />
                ))}
              </div>
              <div className="text-xs mt-3" style={{ color: "var(--pq-text-mute)" }}>
                {Object.keys(k.colors ?? {}).length} colours · {(k.logos ?? []).length} logos
                {k.preset ? ` · preset: ${k.preset}` : ""}
              </div>
            </Frame4D>
          ))}
        </div>
      )}
    </div>
  );
}
