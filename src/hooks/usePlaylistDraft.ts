/**
 * usePlaylistDraft — Hook 3 of 3
 *
 * Responsible ONLY for:
 *  - Debounced autosave (2 s after last change — NOT setInterval)
 *  - Versioned schema guard (CURRENT_DRAFT_VERSION prevents stale-data crashes)
 *  - Restore banner (hasDraft, draftSavedAt, dismiss, restore, discard)
 *  - Clearing draft on successful submit (via onSuccess callback)
 *
 * Crash-prevention measures:
 *  - All localStorage reads wrapped in try/catch
 *  - saved.data?.tracks existence checked with Array.isArray before .length
 *  - isHydrating ref blocks first-render autosave
 *  - Debounce instance lives in useRef (created once, cancel() always reachable)
 *  - No save when isDirty=false (navigation to page never writes blank draft)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  IPlaylistDraft,
  IPlaylistFormFields,
  CURRENT_DRAFT_VERSION,
} from "@/types/playlist.types";
import { debounce } from "@/utils/debounce";
import {
  PLAYLIST_DRAFT_LS_KEY,
  PLAYLIST_DRAFT_DEBOUNCE_MS,
} from "@/constants/playlist.constants";

// ── Safe storage helpers ──────────────────────────────────────────────────────

function readDraft(): IPlaylistDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PLAYLIST_DRAFT_LS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<IPlaylistDraft>;

    // Version guard — discard anything with the wrong schema
    if (typeof parsed.version !== "number" || parsed.version !== CURRENT_DRAFT_VERSION) {
      window.localStorage.removeItem(PLAYLIST_DRAFT_LS_KEY);
      return null;
    }

    // Ensure data shape is valid before returning
    const data = parsed.data;
    if (!data || typeof data !== "object") {
      window.localStorage.removeItem(PLAYLIST_DRAFT_LS_KEY);
      return null;
    }

    // Ensure tracks is always an array (defensive against corrupted drafts)
    if (!Array.isArray(data.tracks)) {
      data.tracks = [];
    }

    return parsed as IPlaylistDraft;
  } catch {
    // Any parse error — clear the corrupted entry
    try { window.localStorage.removeItem(PLAYLIST_DRAFT_LS_KEY); } catch { /* noop */ }
    return null;
  }
}

function writeDraft(data: IPlaylistFormFields): void {
  if (typeof window === "undefined") return;
  try {
    const draft: IPlaylistDraft = {
      version: CURRENT_DRAFT_VERSION,
      savedAt: Date.now(),
      data: {
        ...data,
        // Guarantee tracks is always serialised as an array
        tracks: Array.isArray(data.tracks) ? data.tracks : [],
      },
    };
    window.localStorage.setItem(PLAYLIST_DRAFT_LS_KEY, JSON.stringify(draft));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PLAYLIST_DRAFT_LS_KEY);
  } catch { /* noop */ }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface IUsePlaylistDraftOptions {
  isActive: boolean;
  fields: IPlaylistFormFields;
  isDirty: boolean;
  hydrateFields: (fields: IPlaylistFormFields) => void;
}

export interface IUsePlaylistDraftReturn {
  hasDraft: boolean;
  draftSavedAt: number | null;
  handleRestoreDraft: () => void;
  handleDiscardDraft: () => void;
}

export function usePlaylistDraft({
  isActive,
  fields,
  isDirty,
  hydrateFields,
}: IUsePlaylistDraftOptions): IUsePlaylistDraftReturn {
  const [hasDraft, setHasDraft]           = useState(false);
  const [draftSavedAt, setDraftSavedAt]   = useState<number | null>(null);

  // Prevents autosave firing during initial hydration
  const isHydrating = useRef(true);

  // Stable debounced write — one instance for the component's lifetime.
  // Timestamp is passed in as an argument (not captured via Date.now() here)
  // so the useRef initialiser stays pure — satisfying react-hooks/purity.
  const debouncedSaveRef = useRef(
    debounce((data: IPlaylistFormFields, savedAt: number) => {
      writeDraft(data);
      setDraftSavedAt(savedAt);
    }, PLAYLIST_DRAFT_DEBOUNCE_MS)
  );

  // ── Mount: check for existing draft ───────────────────────────────────────

  useEffect(() => {
    const debouncedSave = debouncedSaveRef.current;

    void (async () => {
      if (!isActive) {
        isHydrating.current = false;
        return;
      }

      const saved = readDraft();
      // Only surface a draft if it has meaningful content
      if (
        saved &&
        saved.data &&
        (saved.data.title?.trim() || (Array.isArray(saved.data.tracks) && saved.data.tracks.length > 0))
      ) {
        setHasDraft(true);
        setDraftSavedAt(saved.savedAt ?? null);
      }

      isHydrating.current = false;
    })();

    return () => debouncedSave.cancel();
  }, [isActive]);

  // ── Autosave: 2 s after last field change ─────────────────────────────────

  useEffect(() => {
    void (async () => {
      // Never save during initial hydration or when nothing has changed
      if (!isActive || isHydrating.current || !isDirty) return;

      // Only save if there is something worth saving
      if (!fields.title?.trim() && (!Array.isArray(fields.tracks) || fields.tracks.length === 0)) {
        return;
      }

      debouncedSaveRef.current(fields, Date.now());
    })();
  }, [fields, isDirty, isActive]);

  // ── Restore ───────────────────────────────────────────────────────────────

  const handleRestoreDraft = useCallback(() => {
    const saved = readDraft();
    if (!saved?.data) return;

    // Ensure complete shape with safe defaults before hydrating
    const safeData: IPlaylistFormFields = {
      title:       saved.data.title       ?? "",
      description: saved.data.description ?? "",
      isPublic:    saved.data.isPublic     ?? true,
      coverArt:    saved.data.coverArt     ?? "",
      genre:       saved.data.genre        ?? "",
      mood:        saved.data.mood         ?? "",
      tracks:      Array.isArray(saved.data.tracks) ? saved.data.tracks : [],
    };

    hydrateFields(safeData);
    setHasDraft(false);
  }, [hydrateFields]);

  // ── Discard ───────────────────────────────────────────────────────────────

  const handleDiscardDraft = useCallback(() => {
    clearDraft();
    debouncedSaveRef.current.cancel();
    setHasDraft(false);
    setDraftSavedAt(null);
  }, []);

  return { hasDraft, draftSavedAt, handleRestoreDraft, handleDiscardDraft };
}
