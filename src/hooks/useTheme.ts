import { useState, useEffect, useCallback } from "react";
import { ResolvedTheme, ThemePreference } from "../types";

const STORAGE_KEY = "pc-theme";

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable
  }
  return "system";
}

function applyTheme(resolved: ResolvedTheme, isLoading: boolean): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  if (isLoading) {
    root.setAttribute("data-theme-loading", "true");
  } else {
    root.removeAttribute("data-theme-loading");
  }
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(
    readStoredPreference
  );

  const resolved: ResolvedTheme =
    preference === "system" ? getSystemTheme() : preference;

  // Apply theme on mount and preference changes
  useEffect(() => {
    // Remove loading flag after a tick so the no-transition rule fires first
    const id = requestAnimationFrame(() => applyTheme(resolved, false));
    return () => cancelAnimationFrame(id);
  }, [resolved]);

  // Listen for system preference changes when using "system" mode
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(getSystemTheme(), false);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  const setAndPersist = useCallback((next: ThemePreference) => {
    setPreference(next);
    try {
      if (next === "system") {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggle = useCallback(() => {
    setAndPersist(resolved === "dark" ? "light" : "dark");
  }, [resolved, setAndPersist]);

  return { preference, resolved, toggle, setPreference: setAndPersist };
}
