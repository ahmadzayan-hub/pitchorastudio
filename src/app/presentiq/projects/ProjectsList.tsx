"use client";

import Link from "next/link";
import { useI18n } from "@/lib/presentiq/i18n/context";
import { Frame4D } from "@/components/presentiq/ui/Frame4D";

type Project = {
  id: string;
  title: string;
  status: string;
  presentation_mode: string;
  language_mode: string;
  updated_at: string;
};

export function ProjectsList({ items }: { items: Project[] }) {
  const { t, lang } = useI18n();

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--pq-text)" }}>
          {t("proj.title")}
        </h1>
        <Link href="/presentiq/projects/new" className="pq-btn pq-btn-primary">＋ {t("nav.new")}</Link>
      </header>

      <Frame4D className="p-0 overflow-hidden" interactive={false}>
        <div className="px-6 py-4">
          {items.length === 0 ? (
            <div className="text-sm" style={{ color: "var(--pq-text-soft)" }}>{t("dash.empty")}</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider" style={{ color: "var(--pq-text-mute)" }}>
                <tr>
                  <th className="text-start py-2">{t("proj.col.title")}</th>
                  <th className="text-start">{t("proj.col.mode")}</th>
                  <th className="text-start">{t("proj.col.lang")}</th>
                  <th className="text-start">{t("proj.col.status")}</th>
                  <th className="text-start">{t("proj.col.updated")}</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(66,87,34,0.14)" }}>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3">
                      <Link
                        href={`/presentiq/projects/${p.id}`}
                        className="font-medium hover:underline"
                        style={{ color: "var(--pq-text)" }}
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td>{p.presentation_mode}</td>
                    <td>{p.language_mode}</td>
                    <td><span className={`pq-status pq-status-${statusClass(p.status)}`}>{p.status}</span></td>
                    <td style={{ color: "var(--pq-text-mute)" }}>
                      {new Date(p.updated_at).toLocaleString(lang === "ar" ? "ar-AE" : "en-AE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Frame4D>
    </div>
  );
}

function statusClass(s: string): "draft" | "ready" | "generating" | "blueprint" {
  if (s === "ready" || s === "approved" || s === "exported") return "ready";
  if (s === "generating" || s === "ingesting") return "generating";
  if (s === "blueprint_ready") return "blueprint";
  return "draft";
}
