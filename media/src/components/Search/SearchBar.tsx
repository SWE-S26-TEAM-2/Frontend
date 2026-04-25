"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchService } from "@/services/api/search.api";
import type { ITrack } from "@/types/track.types";
import type { ISearchUser } from "@/services/api/search.api";

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface Suggestion {
  id: string;
  label: string;
  sublabel: string;
  type: "track" | "user";
}

interface SearchBarProps {
  /** Pre-fill the input — use on /search page to reflect ?q= param */
  defaultValue?: string;
  placeholder?: string;
  /** Override submit behaviour — if omitted, navigates to /search?q=... */
  onSearch?: (query: string) => void;
}

// ── DEBOUNCE HOOK ─────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── ICONS ─────────────────────────────────────────────────────────────────────

const SearchIcon = ({ active }: { active?: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke={active ? "#ff5500" : "#555"} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: "stroke 0.2s" }}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function SearchBar({
  defaultValue = "",
  placeholder = "Search for artists, bands, tracks, podcasts",
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [cursor, setCursor] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 320);

  // Update input if defaultValue changes (e.g. back/forward navigation)
  useEffect(() => { setQuery(defaultValue); }, [defaultValue]);

  // ── Fetch suggestions ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      searchService.searchTracks(debouncedQuery).catch((): ITrack[] => []),
      searchService.searchUsers(debouncedQuery).catch((): ISearchUser[] => []),
    ]).then(([tracks, users]) => {
      if (cancelled) return;

      const built: Suggestion[] = [
        ...tracks.slice(0, 3).map((t) => ({
          id: t.id,
          label: t.title,
          sublabel: t.artist,
          type: "track" as const,
        })),
        ...users.slice(0, 2).map((u) => ({
          id: u.user_id,
          label: u.display_name,
          sublabel: u.account_type,
          type: "user" as const,
        })),
      ];

      setSuggestions(built);
      setOpen(built.length > 0);
      setCursor(-1);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Navigate / submit ──────────────────────────────────────────────────────
  const submit = useCallback((value: string) => {
    if (!value.trim()) return;
    setOpen(false);
    if (onSearch) { onSearch(value.trim()); return; }
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  }, [onSearch, router]);

  const pickSuggestion = (s: Suggestion) => {
    setQuery(s.label);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(s.label)}`);
  };

  // ── Keyboard navigation ────────────────────────────────────────────────────
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      cursor >= 0 ? pickSuggestion(suggestions[cursor]) : submit(query);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} style={s.wrapper}>
      {/* Input box */}
      <div style={{
        ...s.box,
        borderColor: focused ? "#ff5500" : "#2e2e2e",
        boxShadow: focused ? "0 0 0 2px rgba(255,85,0,0.12)" : "none",
      }}>
        <SearchIcon active={focused} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); if (suggestions.length) setOpen(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          style={s.input}
          autoComplete="off"
          spellCheck={false}
        />
        {loading && <Spinner />}
        {query && !loading && (
          <button style={s.clearBtn} onMouseDown={(e) => {
            e.preventDefault();
            setQuery(""); setSuggestions([]); setOpen(false);
            inputRef.current?.focus();
          }}>×</button>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div style={s.dropdown}>
          <div style={s.dropdownLabel}>Suggestions</div>
          {suggestions.map((sg, i) => (
            <button
              key={sg.id}
              style={{ ...s.suggestion, background: i === cursor ? "#242424" : "transparent" }}
              onMouseDown={(e) => { e.preventDefault(); pickSuggestion(sg); }}
              onMouseEnter={() => setCursor(i)}
              onMouseLeave={() => setCursor(-1)}
            >
              <span style={s.suggIcon}>
                {sg.type === "track" ? "♪" : "👤"}
              </span>
              <span style={s.suggBody}>
                <span style={s.suggLabel}>{sg.label}</span>
                <span style={s.suggSub}>{sg.sublabel}</span>
              </span>
              <span style={s.suggType}>{sg.type}</span>
            </button>
          ))}
          <button
            style={s.searchAllBtn}
            onMouseDown={(e) => { e.preventDefault(); submit(query); }}
          >
            <SearchIcon active />
            <span>Search for &ldquo;{query}&rdquo;</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ── SPINNER ───────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div style={{
    width: 14, height: 14, flexShrink: 0,
    border: "2px solid #2e2e2e", borderTopColor: "#ff5500",
    borderRadius: "50%", animation: "spin 0.65s linear infinite",
  }} />
);

// ── STYLES ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  wrapper: { position: "relative", width: "100%", maxWidth: 480 },
  box: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#1a1a1a", borderRadius: 6, padding: "0 12px",
    height: 36, border: "1px solid #2e2e2e",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  input: {
    flex: 1, background: "transparent", border: "none",
    color: "#fff", outline: "none", fontSize: 13,
    fontFamily: "inherit", minWidth: 0,
  },
  clearBtn: {
    background: "none", border: "none", color: "#555",
    fontSize: 18, cursor: "pointer", lineHeight: 1,
    display: "flex", alignItems: "center", padding: "0 2px",
  },
  dropdown: {
    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
    background: "#1a1a1a", border: "1px solid #2e2e2e", borderRadius: 6,
    zIndex: 1200, boxShadow: "0 16px 40px rgba(0,0,0,0.7)", overflow: "hidden",
  },
  dropdownLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
    textTransform: "uppercase", color: "#444", padding: "10px 14px 6px",
  },
  suggestion: {
    display: "flex", alignItems: "center", gap: 10,
    width: "100%", padding: "8px 14px",
    border: "none", cursor: "pointer", textAlign: "left",
    transition: "background 0.1s",
  },
  suggIcon: { fontSize: 13, color: "#ff5500", flexShrink: 0, width: 18 },
  suggBody: {
    flex: 1, display: "flex", flexDirection: "column",
    gap: 1, minWidth: 0,
  },
  suggLabel: {
    color: "#eee", fontSize: 13, fontWeight: 500,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  suggSub: { color: "#555", fontSize: 11 },
  suggType: {
    fontSize: 10, color: "#3a3a3a", textTransform: "uppercase",
    letterSpacing: "0.05em", flexShrink: 0,
  },
  searchAllBtn: {
    display: "flex", alignItems: "center", gap: 8,
    width: "100%", padding: "10px 14px",
    background: "transparent", border: "none",
    borderTop: "1px solid #242424", cursor: "pointer",
    color: "#ff5500", fontSize: 13, fontWeight: 500,
    textAlign: "left",
  },
};
