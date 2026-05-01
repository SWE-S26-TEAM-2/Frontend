"use client";

import { useState, useRef } from "react";
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
import styles from "./PlaylistForm.module.css";

interface IPlaylistMetaFormProps {
  title: string;
  description: string;
  isPublic: boolean;
  coverArt: string;
  genre: PlaylistGenre | "";
  mood: PlaylistMood | "";
  validationErrors: IPlaylistFormErrors;
  /** playlistId is only provided in edit mode — enables direct file upload */
  playlistId?: string;
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
  playlistId,
  onTitleChange,
  onDescriptionChange,
  onTogglePublic,
  onCoverArtChange,
  onGenreChange,
  onMoodChange,
}: IPlaylistMetaFormProps) {
  const [hasImgError, setHasImgError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeTitle    = title    ?? "";
  const safeCoverArt = coverArt ?? "";
  const safeGenre    = genre    ?? "";
  const safeMood     = mood     ?? "";

  const titleRemaining = PLAYLIST_TITLE_MAX_LENGTH - safeTitle.length;
  const hasTitleError  = Boolean(validationErrors?.title);
  const isNearLimit    = titleRemaining <= 20 && titleRemaining >= 0;
  const isAtLimit      = titleRemaining <= 0;
  const displayCover   = (!hasImgError && safeCoverArt) ? safeCoverArt : PLAYLIST_FALLBACK_COVER;

  const handleCoverChange = (url: string) => {
    setHasImgError(false);
    setUploadError("");
    onCoverArtChange(url);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setHasImgError(false);

    if (playlistId) {
      // Edit mode: upload directly to backend
      setIsUploading(true);
      try {
        const { playlistService } = await import("@/services/di");
        const newUrl = await playlistService.uploadCover(playlistId, file);
        onCoverArtChange(newUrl);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    } else {
      // Create mode: convert to data URL so it shows as preview;
      // the persistence hook will PATCH the cover URL after creation.
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onCoverArtChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={styles.pfMeta}>
      {/* Cover art */}
      <div className={styles.pfMeta__coverSection}>
        <div className={styles.pfMeta__coverWrap} aria-label="Playlist cover art preview">
          <Image
            src={displayCover}
            alt="Playlist cover preview"
            width={120}
            height={120}
            className={styles.pfMeta__cover}
            onError={() => setHasImgError(true)}
            unoptimized={safeCoverArt.startsWith("http")}
          />
          <div className={styles.pfMeta__coverOverlay} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Change cover</span>
          </div>
        </div>

        <div className={styles.pfMeta__coverUrl}>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            id="cover-file-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => { void handleFileSelect(e); }}
            aria-label="Upload cover image file"
          />

          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <button
              type="button"
              className={styles.pfInput}
              style={{ cursor: "pointer", textAlign: "left", color: isUploading ? "#888" : undefined }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              aria-label="Upload cover image from file"
            >
              {isUploading ? "Uploading…" : "📁 Upload image file"}
            </button>
          </div>

          <label className={styles.pfLabel} htmlFor="cover-art-input">Or paste image URL</label>
          <input
            id="cover-art-input"
            type="url"
            className={styles.pfInput}
            value={safeCoverArt.startsWith("data:") ? "" : safeCoverArt}
            onChange={(e) => handleCoverChange(e.target.value)}
            placeholder="https://example.com/cover.jpg"
            aria-label="Cover image URL"
            autoComplete="off"
          />
          <span className={styles.pfHint}>
            {uploadError
              ? `⚠ ${uploadError}`
              : hasImgError && safeCoverArt
                ? "⚠ Image could not be loaded — showing default cover."
                : safeCoverArt.startsWith("data:")
                  ? "✓ Image selected — will be uploaded on save."
                  : "Upload a file or paste an image URL."}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className={styles.pfField}>
        <div className={styles.pfField__header}>
          <label
            className={`${styles.pfLabel} ${styles["pfLabel--required"]}`}
            htmlFor="playlist-title"
          >
            Title
          </label>
          <span
            className={[
              styles.pfCharCount,
              isAtLimit ? styles["pfCharCount--danger"] : isNearLimit ? styles["pfCharCount--warn"] : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-live="polite"
            aria-label={`${titleRemaining} characters remaining`}
          >
            {titleRemaining}
          </span>
        </div>
        <input
          id="playlist-title"
          type="text"
          className={[
            styles.pfInput,
            hasTitleError ? styles["pfInput--error"] : "",
          ]
            .filter(Boolean)
            .join(" ")}
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
          <span id="title-error" className={styles.pfError} role="alert">
            {validationErrors.title}
          </span>
        )}
      </div>

      {/* Description */}
      <div className={styles.pfField}>
        <label className={styles.pfLabel} htmlFor="playlist-description">
          Description
          <span className={styles.pfLabel__optional}> (optional)</span>
        </label>
        <textarea
          id="playlist-description"
          className={styles.pfTextarea}
          value={description ?? ""}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          placeholder="Add an optional description"
          aria-label="Playlist description"
        />
      </div>

      {/* Genre + Mood — side by side */}
      <div className={`${styles.pfField} ${styles["pfField--row"]} ${styles["pfField--selects"]}`}>
        <div className={`${styles.pfField} ${styles["pfField--grow"]}`}>
          <label className={styles.pfLabel} htmlFor="playlist-genre">
            Genre<span className={styles.pfLabel__optional}> (optional)</span>
          </label>
          <div className={styles.pfSelectWrap}>
            <select
              id="playlist-genre"
              className={styles.pfSelect}
              value={safeGenre}
              onChange={(e) => onGenreChange(e.target.value as PlaylistGenre | "")}
              aria-label="Playlist genre"
            >
              <option value="">— Select genre —</option>
              {PLAYLIST_GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <span className={styles.pfSelectWrap__chevron} aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>

        <div className={`${styles.pfField} ${styles["pfField--grow"]}`}>
          <label className={styles.pfLabel} htmlFor="playlist-mood">
            Mood<span className={styles.pfLabel__optional}> (optional)</span>
          </label>
          <div className={styles.pfSelectWrap}>
            <select
              id="playlist-mood"
              className={styles.pfSelect}
              value={safeMood}
              onChange={(e) => onMoodChange(e.target.value as PlaylistMood | "")}
              aria-label="Playlist mood"
            >
              <option value="">— Select mood —</option>
              {PLAYLIST_MOODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <span className={styles.pfSelectWrap__chevron} aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Privacy toggle */}
      <div className={`${styles.pfField} ${styles["pfField--row"]}`}>
        <div className={styles.pfField__text}>
          <span className={styles.pfLabel}>Visibility</span>
          <span className={styles.pfHint}>
            {isPublic
              ? "Public — anyone can find and play this playlist."
              : "Private — only you can see this playlist."}
          </span>
        </div>
        <button
          type="button"
          className={[
            styles.pfToggle,
            isPublic ? styles["pfToggle--on"] : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={onTogglePublic}
          aria-pressed={isPublic}
          aria-label={isPublic ? "Set playlist to private" : "Set playlist to public"}
        >
          <span className={styles.pfToggle__track} aria-hidden="true">
            <span className={styles.pfToggle__thumb} />
          </span>
          <span className={styles.pfToggle__label}>{isPublic ? "Public" : "Private"}</span>
        </button>
      </div>
    </div>
  );
}
