"use client";

import type { CSSProperties } from "react";

type Variant = "horizontal" | "icon" | "wordmark" | "favicon";

type Props = {
  variant?: Variant;
  height?: number;
  className?: string;
  style?: CSSProperties;
  /** Render the "by Zaian" subline beneath the wordmark. */
  byline?: boolean;
};

/**
 * Pitchora logo system (v0.6 refresh).
 *
 * Mark: a stylised aurora-arc rising from a slide corner. The arc
 * encodes "Pitch + Aurora" (the brand's etymology) in a single
 * gesture, and the underlying rounded square reads as a slide.
 * Wordmark: Pitchora set in an 800-weight geometric sans with a
 * subtle aurora-tinted 'ora' tail.
 *
 * Pure SVG. Sharpens at any DPI, ships with no external assets.
 */
export function Logo({
  variant = "horizontal",
  height = 28,
  className = "",
  style,
  byline = false,
}: Props) {
  if (variant === "icon" || variant === "favicon") {
    const size = height;
    return (
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        className={className}
        style={style}
        aria-label="Pitchora"
        role="img"
      >
        <Defs />
        <IconMark />
      </svg>
    );
  }

  if (variant === "wordmark") {
    const w = (height / 28) * 176;
    return (
      <svg
        viewBox="0 0 176 36"
        width={w}
        height={height}
        className={className}
        style={style}
        aria-label="Pitchora"
        role="img"
      >
        <Defs />
        <Wordmark />
      </svg>
    );
  }

  // Horizontal — mark + wordmark side-by-side, optional "by Zaian" byline.
  const w = (height / 28) * (byline ? 236 : 226);
  return (
    <svg
      viewBox={byline ? "0 0 236 44" : "0 0 226 36"}
      width={w}
      height={byline ? (height / 36) * 44 : height}
      className={className}
      style={style}
      aria-label="Pitchora"
      role="img"
    >
      <Defs />
      <g transform="translate(2,0)">
        <IconMark />
      </g>
      <g transform="translate(58,3)">
        <Wordmark />
      </g>
      {byline && (
        <text
          x={58 + 168}
          y={42}
          textAnchor="end"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="9"
          fontWeight="600"
          letterSpacing="0.22em"
          fill="var(--pq-byline, #95A0CB)"
        >
          BY ZAIAN
        </text>
      )}
    </svg>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function Defs() {
  return (
    <defs>
      {/* Slide tile — deep indigo */}
      <linearGradient id="pq-mark-tile" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stopColor="#1E2654" />
        <stop offset="55%"  stopColor="#161D44" />
        <stop offset="100%" stopColor="#0E1330" />
      </linearGradient>
      {/* Aurora arc — signature gradient */}
      <linearGradient id="pq-mark-aurora" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%"   stopColor="#6366F1" />
        <stop offset="45%"  stopColor="#8A6CF7" />
        <stop offset="100%" stopColor="#C084FC" />
      </linearGradient>
      {/* Ascending line dot */}
      <linearGradient id="pq-mark-dot" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stopColor="#C084FC" />
        <stop offset="100%" stopColor="#818CF8" />
      </linearGradient>
      {/* Wordmark cool base */}
      <linearGradient id="pq-word-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#F2F4FF" />
        <stop offset="100%" stopColor="#C7CBF6" />
      </linearGradient>
      {/* Wordmark aurora tail on 'ora' */}
      <linearGradient id="pq-word-tail" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stopColor="#8A6CF7" />
        <stop offset="100%" stopColor="#C084FC" />
      </linearGradient>
      {/* Soft outer glow behind the mark */}
      <radialGradient id="pq-mark-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="rgba(138,108,247,0.45)" />
        <stop offset="60%"  stopColor="rgba(138,108,247,0.08)" />
        <stop offset="100%" stopColor="rgba(138,108,247,0)" />
      </radialGradient>
      <filter id="pq-mark-soft" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="0.9" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/**
 * The mark itself: a rounded-square slide with an aurora arc rising
 * from the bottom-left through a headline bar and a bullet stack,
 * closing in a bright terminal dot at the top-right. Reads at 16px.
 */
function IconMark() {
  return (
    <g>
      {/* Outer halo */}
      <rect x="0" y="0" width="48" height="48" rx="12" fill="url(#pq-mark-glow)" opacity="0.9" />
      {/* Slide tile */}
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="10"
        fill="url(#pq-mark-tile)"
        stroke="#8A6CF7"
        strokeOpacity="0.42"
        strokeWidth="0.9"
      />
      {/* Inner hairline */}
      <rect x="3.6" y="3.6" width="40.8" height="40.8" rx="9.4" fill="none" stroke="rgba(255,255,255,0.05)" />

      {/* Slide content ghost lines (headline + bullets) */}
      <rect x="10" y="14" width="20" height="2.4" rx="1.2" fill="rgba(199,203,246,0.28)" />
      <rect x="10" y="19.5" width="14" height="1.6" rx="0.8" fill="rgba(199,203,246,0.18)" />
      <rect x="10" y="23.5" width="17" height="1.6" rx="0.8" fill="rgba(199,203,246,0.18)" />
      <rect x="10" y="27.5" width="12" height="1.6" rx="0.8" fill="rgba(199,203,246,0.18)" />

      {/* Aurora arc — the pitch */}
      <path
        d="M11 36 C 18 30, 26 26, 34 21 C 37 19, 39 16, 40 13"
        fill="none"
        stroke="url(#pq-mark-aurora)"
        strokeWidth="2.4"
        strokeLinecap="round"
        filter="url(#pq-mark-soft)"
      />
      {/* Terminal dot at the arc's peak */}
      <circle cx="40" cy="13" r="2.4" fill="url(#pq-mark-dot)" />
      <circle cx="40" cy="13" r="4.2" fill="none" stroke="rgba(192,132,252,0.35)" strokeWidth="0.8" />

      {/* Anchor dot at the arc's base */}
      <circle cx="11" cy="36" r="1.8" fill="#8A6CF7" opacity="0.9" />
    </g>
  );
}

function Wordmark() {
  // "Pitch" cool, "ora" aurora-tinted. Underline arc echoes the mark.
  return (
    <g>
      <text
        x="0"
        y="26"
        fontFamily="Inter, 'Segoe UI', system-ui, sans-serif"
        fontWeight="800"
        fontSize="28"
        letterSpacing="-0.025em"
        fill="url(#pq-word-fill)"
      >
        Pitch
      </text>
      <text
        x="76"
        y="26"
        fontFamily="Inter, 'Segoe UI', system-ui, sans-serif"
        fontWeight="800"
        fontSize="28"
        letterSpacing="-0.025em"
        fill="url(#pq-word-tail)"
      >
        ora
      </text>
      {/* Aurora arc under 'ora' — brand echo */}
      <path
        d="M78 30 Q 118 34, 152 30"
        fill="none"
        stroke="url(#pq-mark-aurora)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Terminal dot on the arc */}
      <circle cx="152" cy="30" r="1.6" fill="#C084FC" />
    </g>
  );
}
