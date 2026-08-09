"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* ignore quota / private mode */
  }
}

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* ignore */
  }

  if (document.documentElement.classList.contains("dark")) return "dark";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setReady(true);
  }, []);

  const label =
    theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему";

  return (
    <button
      type="button"
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-button)] border border-border bg-surface text-foreground transition-[color,background-color,transform] hover:bg-surface-soft hover:-translate-y-0.5"
      aria-label={label}
      title={label}
      onClick={() => {
        const current = ready ? theme : readTheme();
        const next: Theme = current === "dark" ? "light" : "dark";
        applyTheme(next);
        setTheme(next);
        setReady(true);
      }}
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" size={20} strokeWidth={1.75} />
      ) : (
        <Moon aria-hidden="true" size={20} strokeWidth={1.75} />
      )}
    </button>
  );
}
