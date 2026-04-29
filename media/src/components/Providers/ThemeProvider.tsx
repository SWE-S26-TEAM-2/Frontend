"use client";

import { useTheme } from "@/hooks/useTheme";

/**
 * ThemeProvider — mounts useTheme so the correct data-theme attribute
 * is applied to <html> on every page load, before any content paints.
 * Renders nothing itself; wraps children transparently.
 */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useTheme();
  return <>{children}</>;
}
