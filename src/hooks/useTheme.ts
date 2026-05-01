"use client";

import { useEffect, useCallback } from "react";
import { ITheme } from "@/types/settings-account.types";

const STORAGE_KEY = "sc_theme";

/** Resolve 'automatic' to the actual CSS value based on system preference. */
function resolveTheme(preference: ITheme): "dark" | "light" {
  if (preference === "automatic") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
}

/** Write the resolved theme to the <html> data-theme attribute. */
function applyThemeToDOM(preference: ITheme): void {
  const resolved = resolveTheme(preference);
  document.documentElement.setAttribute("data-theme", resolved);
}

/**
 * useTheme — reads the stored theme preference on mount, applies it to
 * <html data-theme="...">, and returns a setter that persists + applies
 * any new choice immediately.
 *
 * Usage:
 *   const { setTheme } = useTheme();
 *   setTheme("light");   // persists to localStorage + updates DOM instantly
 */
export function useTheme() {
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ITheme) ?? "dark";
    applyThemeToDOM(stored);

    // Re-apply when system dark/light preference changes (only matters for "automatic")
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMQChange = () => {
      const current = (localStorage.getItem(STORAGE_KEY) as ITheme) ?? "dark";
      if (current === "automatic") applyThemeToDOM("automatic");
    };

    mq.addEventListener("change", handleMQChange);
    return () => mq.removeEventListener("change", handleMQChange);
  }, []);

  const setTheme = useCallback((theme: ITheme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyThemeToDOM(theme);
  }, []);

  return { setTheme };
}

/** Read the stored preference without mounting a component (e.g. in SSR-safe guards). */
export function getStoredTheme(): ITheme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(STORAGE_KEY) as ITheme) ?? "dark";
}
