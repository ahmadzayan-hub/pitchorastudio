"use client";

import { useEffect, useState } from "react";

/**
 * ThemeToggle — flips the Pitchora UI between dark (default) and light
 * by setting `data-pq-theme` on the wrapper. Persists across reloads in
 * localStorage. CSS overrides live in globals.css under
 * `[data-pq][data-pq-theme="light"]`.
 */
const STORAGE_KEY = "pq-theme";

type Theme = "dark" | "light";

function readInitial(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* private mode */
  }
  return "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = readInitial();
    setTheme(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.querySelector("[data-pq]") as HTMLElement | null;
    if (root) root.setAttribute("data-pq-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme, mounted]);

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="pq-theme-toggle"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <span aria-hidden style={{ fontSize: "0.95rem", lineHeight: 1 }}>
        {theme === "dark" ? "☀" : "☾"}
      </span>
    </button>
  );
}
