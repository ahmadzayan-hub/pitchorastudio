"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  variant?: "mint" | "pine";
  interactive?: boolean;
};

/**
 * 4D Frame card — multi-layered depth surface that subtly tilts on mouse-move
 * to convey depth without being noisy. Disable interaction with `interactive={false}`.
 */
export function Frame4D({ children, className = "", variant = "mint", interactive = true }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (!interactive) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1100px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-3px)`;
  }
  function onLeave() {
    if (!interactive) return;
    const el = ref.current;
    if (el) el.style.transform = "";
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`pq-frame ${variant === "pine" ? "pq-frame-pine" : ""} ${interactive ? "is-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
