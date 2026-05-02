"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      return;
    }

    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("theme-dark");
    } else {
      root.classList.remove("theme-dark");
    }
    try { window.localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <button
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      onClick={toggle}
      className="header-action-button bg-transparent border-none cursor-pointer text-[#bbb] flex items-center justify-center w-9 h-9 transition-colors hover:text-white"
    >
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21.64 13.04A9 9 0 1110.96 2.36 7 7 0 0021.64 13.04z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 4.5a1 1 0 011-1h0a1 1 0 011 1V6a1 1 0 01-2 0V4.5zM12 18a1 1 0 011 1v1.5a1 1 0 01-2 0V19a1 1 0 011-1zM4.5 11a1 1 0 01-1-1h0a1 1 0 011-1H6a1 1 0 010 2H4.5zM18 11a1 1 0 011-1h1.5a1 1 0 010 2H19a1 1 0 01-1-1zM6.22 6.22a1 1 0 011.42 0l1.06 1.06a1 1 0 11-1.42 1.42L6.22 7.64a1 1 0 010-1.42zM16.3 16.3a1 1 0 011.42 0l1.06 1.06a1 1 0 11-1.42 1.42l-1.06-1.06a1 1 0 010-1.42zM16.3 7.64a1 1 0 010 1.42l-1.06 1.06a1 1 0 11-1.42-1.42l1.06-1.06a1 1 0 011.42 0zM7.64 16.3a1 1 0 010 1.42l-1.06 1.06a1 1 0 11-1.42-1.42l1.06-1.06a1 1 0 011.42 0z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}
