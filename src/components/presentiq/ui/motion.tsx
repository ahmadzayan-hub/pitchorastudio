"use client";

import {
  ReactNode,
  useEffect,
  useRef,
} from "react";

/**
 * Pitchora motion primitives — small, dependency-free React helpers
 * that pair with the `.pq-*` CSS utilities defined in globals.css.
 *
 * Every primitive respects `prefers-reduced-motion`. When the user
 * has that on, we mount the children in their final state and skip
 * pointer / scroll listeners entirely.
 */

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/* ── Scroll reveal ─────────────────────────────────────────────── */

type RevealProps = {
  children: ReactNode;
  /** "stagger" reveals each direct child with a delay; "single" reveals as one block. */
  variant?: "single" | "stagger";
  as?: "div" | "section" | "ul" | "header";
  className?: string;
  /** How much of the element must be visible before it fires. 0..1, default 0.18. */
  threshold?: number;
};

export function Reveal({
  children,
  variant = "single",
  as: Tag = "div",
  className = "",
  threshold = 0.18,
}: RevealProps) {
  // Historically this used IntersectionObserver to gate content behind
  // an opacity:0 → 1 transition on scroll. That silently broke on
  // full-page snapshots (Playwright, SEO tooling, print) and on very
  // tall landings where the browser had already painted before the
  // observer fired, leaving whole marketing sections invisible. We now
  // render content unconditionally; the CSS class is still emitted so
  // the entry animation can run on real user page loads via a simple
  // CSS keyframe (see globals.css → .pq-reveal / .pq-reveal-stagger).
  const base = variant === "stagger" ? "pq-reveal-stagger" : "pq-reveal";
  const cls = `${base} is-visible${className ? ` ${className}` : ""}`;
  return <Tag className={cls}>{children}</Tag>;
}

/* ── Magnetic surface (spotlight + slight follow) ──────────────── */

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** Translation strength in px at the corners. Default 6. */
  strength?: number;
  /** Render as <button>/<a>/<span>… via the `as` prop. */
  as?: "button" | "a" | "div" | "span";
} & Record<string, any>;

export function Magnetic({
  children,
  className = "",
  strength = 6,
  as: Tag = "div",
  ...rest
}: MagneticProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    function onMove(e: PointerEvent) {
      const r = el!.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el!.style.setProperty("--mx", String(px * 100));
      el!.style.setProperty("--my", String(py * 100));
      const tx = (px - 0.5) * 2 * strength;
      const ty = (py - 0.5) * 2 * strength;
      el!.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    }
    function reset() {
      if (!el) return;
      el.style.transform = "translate3d(0,0,0)";
      el.style.setProperty("--mx", "50");
      el.style.setProperty("--my", "50");
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
    };
  }, [strength]);

  const cls = `pq-magnetic${className ? ` ${className}` : ""}`;
  return (
    <Tag ref={ref as any} className={cls} {...rest}>
      {children}
    </Tag>
  );
}

/* ── Tilt-on-hover surface (3D-feel without dependencies) ─────── */

type TiltProps = {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees at the corner. Default 6. */
  max?: number;
  as?: "div" | "a" | "section";
} & Record<string, any>;

export function Tilt({
  children,
  className = "",
  max = 6,
  as: Tag = "div",
  ...rest
}: TiltProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    function onMove(e: PointerEvent) {
      const r = el!.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      // Inverted Y so the top of the card tilts back when the cursor
      // moves up — feels natural.
      el!.style.setProperty("--rx", String(px * 2 * max));
      el!.style.setProperty("--ry", String(-py * 2 * max));
    }
    function reset() {
      if (!el) return;
      el.style.setProperty("--rx", "0");
      el.style.setProperty("--ry", "0");
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
    };
  }, [max]);

  const cls = `pq-tilt${className ? ` ${className}` : ""}`;
  return (
    <Tag ref={ref as any} className={cls} {...rest}>
      {children}
    </Tag>
  );
}

/* ── Parallax mesh: orbs that drift toward the cursor ─────────── */

type ParallaxMeshProps = {
  /** Strength of the parallax movement in px. Default 24. */
  intensity?: number;
  className?: string;
};

export function ParallaxMesh({ intensity = 24, className = "" }: ParallaxMeshProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function onMove(e: PointerEvent) {
      const r = el!.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width - 0.5) * intensity;
      targetY = ((e.clientY - r.top) / r.height - 0.5) * intensity;
      el!.style.setProperty("--sx", String(((e.clientX - r.left) / r.width) * 100));
      el!.style.setProperty("--sy", String(((e.clientY - r.top) / r.height) * 100));
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function tick() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      el!.querySelectorAll<HTMLElement>(".pq-orb").forEach((orb, i) => {
        const depth = 0.4 + (i % 4) * 0.25;
        orb.style.setProperty("--pq-orb-x", String(currentX * depth));
        orb.style.setProperty("--pq-orb-y", String(currentY * depth));
      });
      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    }

    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [intensity]);

  return (
    <div
      ref={ref}
      className={`pq-hero-spotlight ${className}`}
      style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit" }}
      aria-hidden
    >
      <span className="pq-orb pq-orb-1" />
      <span className="pq-orb pq-orb-2" />
      <span className="pq-orb pq-orb-3" />
      <span className="pq-orb pq-orb-4" />
    </div>
  );
}

/* ── Animated letter-by-letter wordmark ────────────────────────── */

type AuroraWordProps = {
  text: string;
  className?: string;
  /** Delay (ms) before the first letter starts. Default 0. */
  start?: number;
  /** Per-letter delay in ms. Default 55. */
  step?: number;
};

export function AuroraWord({ text, className = "", start = 0, step = 55 }: AuroraWordProps) {
  // Render each character as a span so we can stagger animation-delays.
  // Spaces collapse otherwise — use a non-breaking gap.
  return (
    <span className={`pq-aurora-text ${className}`}>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          className="pq-letter"
          style={{ animationDelay: `${start + i * step}ms` }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
