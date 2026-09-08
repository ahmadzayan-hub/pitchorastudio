"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/I18nProvider";

interface Props {
  text: string;
  intent: string | null;
  className?: string;
}

const W = 1200;
const H = 1500;

/**
 * Render the final prompt as a shareable 1200×1500 PNG with subtle branding.
 *
 * Drawn entirely on a hidden <canvas> when the user clicks "Save image" — no
 * external libraries, no server round-trip. The result downloads as a file
 * the user can drop straight into Twitter/Instagram/LinkedIn.
 *
 * Aspect ratio is portrait (4:5) which is the universally-safe social size:
 * fully visible on Twitter, IG feed, IG stories (with crop), LinkedIn.
 */
export default function PromptCard({ text, intent, className }: Props) {
  const t = useT();
  const [busy, setBusy] = useState(false);

  function rgb(s: string) { return s; } // small helper to keep the code tidy

  function drawWrapped(
    ctx: CanvasRenderingContext2D,
    str: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number
  ): number {
    const words = str.split(/\s+/);
    let line = "";
    let drawn = 0;
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + " " + words[i] : words[i];
      const m = ctx.measureText(test);
      if (m.width > maxWidth && line) {
        if (drawn === maxLines - 1) {
          ctx.fillText(line + "…", x, y);
          drawn += 1;
          return y + lineHeight;
        }
        ctx.fillText(line, x, y);
        line = words[i];
        y += lineHeight;
        drawn += 1;
      } else {
        line = test;
      }
    }
    if (line && drawn < maxLines) {
      ctx.fillText(line, x, y);
      y += lineHeight;
    }
    return y;
  }

  function makeCard(): string {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Background: brand gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,    rgb("#6366f1"));
    grad.addColorStop(0.55, rgb("#8b5cf6"));
    grad.addColorStop(1,    rgb("#ec4899"));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Inner card
    const pad = 64;
    const cardX = pad, cardY = pad + 40, cardW = W - pad * 2, cardH = H - pad * 2 - 40;
    ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
    roundRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fill();

    // Top — brand wordmark
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 56px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.fillText("ZAIan Studio", pad + 32, pad + 88);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "500 28px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.fillText("زيان ستوديو · From the UAE 🇦🇪 to the world", pad + 32, pad + 132);

    // Intent pill
    if (intent) {
      const pillX = pad + 32, pillY = cardY + 64;
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      const label = `# ${intent}`;
      ctx.font = "600 24px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
      const m = ctx.measureText(label);
      roundRect(ctx, pillX, pillY, m.width + 32, 40, 20);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, pillX + 16, pillY + 28);
    }

    // Prompt body
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "400 30px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    drawWrapped(
      ctx,
      text,
      pad + 32,
      cardY + 156,
      cardW - 64,
      42,
      24    // up to ~24 lines, then ellipsis
    );

    // Footer — site URL
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "500 24px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    const url =
      typeof window !== "undefined" ? window.location.host : "promptzaian";
    ctx.fillText(url, pad + 32, H - pad - 24);

    // Right-side spark
    drawSpark(ctx, W - pad - 96, pad + 80, 32);

    return canvas.toDataURL("image/png");
  }

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
  }

  function drawSpark(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size * 0.32, cy - size * 0.32);
    ctx.lineTo(cx + size, cy);
    ctx.lineTo(cx + size * 0.32, cy + size * 0.32);
    ctx.lineTo(cx, cy + size);
    ctx.lineTo(cx - size * 0.32, cy + size * 0.32);
    ctx.lineTo(cx - size, cy);
    ctx.lineTo(cx - size * 0.32, cy - size * 0.32);
    ctx.closePath();
    ctx.fill();
  }

  async function download() {
    if (busy) return;
    setBusy(true);
    try {
      const url = makeCard();
      if (!url) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = `zaian-studio-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setBusy(false);
    }
  }

  async function shareImage() {
    if (busy) return;
    setBusy(true);
    try {
      const url = makeCard();
      if (!url) return;
      // Convert data URL → File so navigator.share can attach the image
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], "zaian-studio.png", { type: "image/png" });
      const navAny = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
      if (typeof navigator !== "undefined" && navAny.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "ZAIan Studio",
          text: "Built with ZAIan Studio · زيان ستوديو"
        });
        return;
      }
      // Fallback: just download
      void download();
    } catch {
      void download();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={"flex items-center gap-2 " + (className ?? "")}>
      <button
        type="button"
        onClick={download}
        disabled={busy || !text.trim()}
        className="btn-ghost border border-slate-300 dark:border-slate-700 text-xs"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        {t("card.save_image")}
      </button>
      <button
        type="button"
        onClick={shareImage}
        disabled={busy || !text.trim()}
        className="btn-ghost border border-slate-300 dark:border-slate-700 text-xs"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        {t("card.share_image")}
      </button>
    </div>
  );
}
