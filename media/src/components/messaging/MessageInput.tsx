'use client';

/**
 * src/components/messaging/MessageInput.tsx
 *
 * Message input bar:
 *  - Auto-grow textarea (Enter = send, Shift+Enter = newline)
 *  - 🎵 button opens TrackPicker (fixed-positioned, never clipped)
 *  - Send button
 *
 * Pure presentational — no business logic.
 */

import { ChangeEvent, KeyboardEvent, useCallback, useRef, useState } from 'react';
import styles from './MessageInput.module.css';
import { TrackPicker } from './TrackPicker';
import type { ITrack } from '@/types/track.types';

export interface IMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSendTrack: (track: ITrack) => void;
  onTyping?: () => void;
  tracks: ITrack[];
  isLoadingTracks: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  onSendTrack,
  onTyping,
  tracks,
  isLoadingTracks,
  disabled = false,
  placeholder = 'Send a message…',
}: IMessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // anchorRef is passed to TrackPicker so it can position itself via getBoundingClientRect
  const trackBtnRef = useRef<HTMLButtonElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // ── Textarea handlers ────────────────────────────────────────────────────────

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
      onTyping?.();
      const el = e.target;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    },
    [onChange, onTyping]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        setIsPickerOpen(false);
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (value.trim()) {
          onSend();
          if (textareaRef.current) textareaRef.current.style.height = 'auto';
        }
      }
    },
    [onSend, value]
  );

  const handleSendClick = useCallback(() => {
    if (value.trim()) {
      onSend();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }
  }, [onSend, value]);

  // ── Track picker handlers ────────────────────────────────────────────────────

  const handleTrackBtnClick = useCallback(() => {
    setIsPickerOpen((prev: boolean) => !prev);
  }, []);

  const handleTrackSelect = useCallback(
    (track: ITrack) => {
      onSendTrack(track);
      setIsPickerOpen(false);
      textareaRef.current?.focus();
    },
    [onSendTrack]
  );

  const handlePickerClose = useCallback(() => {
    setIsPickerOpen(false);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className={styles.container}>
      {/* 🎵 Track share button */}
      <button
        ref={trackBtnRef}
        className={`${styles.trackBtn} ${isPickerOpen ? styles.active : ''}`}
        onClick={handleTrackBtnClick}
        disabled={disabled}
        aria-label="Share a track"
        title="Share a track"
        type="button"
      >
        🎵
      </button>

      {/* TrackPicker — rendered here but uses position:fixed internally */}
      {isPickerOpen && (
        <TrackPicker
          anchorRef={trackBtnRef}
          tracks={tracks}
          isLoading={isLoadingTracks}
          onSelect={handleTrackSelect}
          onClose={handlePickerClose}
        />
      )}

      {/* Text input */}
      <div className={styles.inputWrap}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
        />
      </div>

      {/* Send button */}
      <button
        className={styles.sendBtn}
        onClick={handleSendClick}
        disabled={!canSend}
        aria-label="Send message"
        type="button"
      >
        ➤
      </button>
    </div>
  );
}
