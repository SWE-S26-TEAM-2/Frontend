"use client";

import { useState } from "react";
import Image from "next/image";
import {
  PLAYLIST_TITLE_MAX_LENGTH,
  PLAYLIST_FALLBACK_COVER,
  PLAYLIST_GENRES,
  PLAYLIST_MOODS,
} from "@/constants/playlist.constants";
import type {
  IPlaylistFormErrors,
  PlaylistGenre,
  PlaylistMood,
} from "@/types/playlist.types";

interface IPlaylistMetaFormProps {
  title: string;
  description: string;
  isPublic: boolean;
  coverArt: string;
  genre: PlaylistGenre | "";
  mood: PlaylistMood | "";
  validationErrors: IPlaylistFormErrors;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTogglePublic: () => void;
  onCoverArtChange: (url: string) => void;
  onGenreChange: (value: PlaylistGenre | "") => void;
  onMoodChange: (value: PlaylistMood | "") => void;
}

export default function PlaylistMetaForm({
  title,
  description,
  isPublic,
  coverArt,
  genre,
  mood,
  validationErrors,
  onTitleChange,
  onDescriptionChange,
  onTogglePublic,
  onCoverArtChange,
  onGenreChange,
  onMoodChange,
}: IPlaylistMetaFormProps) {
  const [hasImgError, setHasImgError] = useState(false);

  const safeTitle      = title       ?? "";
  const safeCoverArt   = coverArt    ?? "";
  const safeGenre      = genre       ?? "";
  const safeMood       = mood        ?? "";

  const titleRemaining = PLAYLIST_TITLE_MAX_LENGTH - safeTitle.length;
  const hasTitleError  = Boolean(validationErrors?.title);
  const isNearLimit    = titleRemaining <= 20 && titleRemaining >= 0;
  const isAtLimit      = titleRemaining <= 0;
  const displayCover   = (!hasImgError && safeCoverArt) ? safeCoverArt : PLAYLIST_FALLBACK_COVER;

  const handleCoverChange = (url: string) => {
    setHasImgError(false);
    onCoverArtChange(url);
  };

  return (
    <div className="pf-meta">
      {/* ── Cover art ── */}
      <div className="pf-meta__cover-section">
        <div className="pf-meta__cover-wrap" aria-label="Playlist cover art preview">
          <Image
            src={displayCover}
            alt="Playlist cover preview"
            width={120}
            height={120}
            className="pf-meta__cover"
            onError={() => setHasImgError(true)}
            unoptimized={safeCoverArt.startsWith("http")}
          />
          <div className="pf-meta__cover-overlay" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Change cover</span>
          </div>
        </div>

        <div className="pf-meta__cover-url">
          <label className="pf-label" htmlFor="cover-art-input">Cover image URL</label>
          <input
            id="cover-art-input"
            type="url"
            className="pf-input"
            value={safeCoverArt}
            onChange={(e) => handleCoverChange(e.target.value)}
            placeholder="https://example.com/cover.jpg"
            aria-label="Cover image URL"
            autoComplete="off"
          />
          <span className="pf-hint">
            {hasImgError && safeCoverArt
              ? "⚠ Image could not be loaded — showing default cover."
              : "Paste an image URL or leave blank to use the default cover."}
          </span>
        </div>
      </div>

      {/* ── Title ── */}
      <div className="pf-field">
        <div className="pf-field__header">
          <label className="pf-label pf-label--required" htmlFor="playlist-title">Title</label>
          <span
            className={`pf-char-count${isAtLimit ? " pf-char-count--danger" : isNearLimit ? " pf-char-count--warn" : ""}`}
            aria-live="polite"
            aria-label={`${titleRemaining} characters remaining`}
          >
            {titleRemaining}
          </span>
        </div>
        <input
          id="playlist-title"
          type="text"
          className={`pf-input${hasTitleError ? " pf-input--error" : ""}`}
          value={safeTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={PLAYLIST_TITLE_MAX_LENGTH}
          placeholder="Name your playlist"
          aria-required="true"
          aria-describedby={hasTitleError ? "title-error" : undefined}
          aria-invalid={hasTitleError}
          autoComplete="off"
        />
        {hasTitleError && (
          <span id="title-error" className="pf-error" role="alert">
            {validationErrors.title}
          </span>
        )}
      </div>

      {/* ── Description ── */}
      <div className="pf-field">
        <label className="pf-label" htmlFor="playlist-description">
          Description<span className="pf-label__optional"> (optional)</span>
        </label>
        <textarea
          id="playlist-description"
          className="pf-textarea"
          value={description ?? ""}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          placeholder="Add an optional description"
          aria-label="Playlist description"
        />
      </div>

      {/* ── Genre + Mood — side by side ── */}
      <div className="pf-field pf-field--row pf-field--selects">
        <div className="pf-field pf-field--grow">
          <label className="pf-label" htmlFor="playlist-genre">
            Genre<span className="pf-label__optional"> (optional)</span>
          </label>
          <div className="pf-select-wrap">
            <select
              id="playlist-genre"
              className="pf-select"
              value={safeGenre}
              onChange={(e) => onGenreChange(e.target.value as PlaylistGenre | "")}
              aria-label="Playlist genre"
            >
              <option value="">— Select genre —</option>
              {PLAYLIST_GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <span className="pf-select-wrap__chevron" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>

        <div className="pf-field pf-field--grow">
          <label className="pf-label" htmlFor="playlist-mood">
            Mood<span className="pf-label__optional"> (optional)</span>
          </label>
          <div className="pf-select-wrap">
            <select
              id="playlist-mood"
              className="pf-select"
              value={safeMood}
              onChange={(e) => onMoodChange(e.target.value as PlaylistMood | "")}
              aria-label="Playlist mood"
            >
              <option value="">— Select mood —</option>
              {PLAYLIST_MOODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <span className="pf-select-wrap__chevron" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* ── Privacy toggle ── */}
      <div className="pf-field pf-field--row">
        <div className="pf-field__text">
          <span className="pf-label">Visibility</span>
          <span className="pf-hint">
            {isPublic
              ? "Public — anyone can find and play this playlist."
              : "Private — only you can see this playlist."}
          </span>
        </div>
        <button
          type="button"
          className={`pf-toggle${isPublic ? " pf-toggle--on" : ""}`}
          onClick={onTogglePublic}
          aria-pressed={isPublic}
          aria-label={isPublic ? "Set playlist to private" : "Set playlist to public"}
        >
          <span className="pf-toggle__track" aria-hidden="true">
            <span className="pf-toggle__thumb" />
          </span>
          <span className="pf-toggle__label">{isPublic ? "Public" : "Private"}</span>
        </button>
      </div>
    </div>
  );
}
