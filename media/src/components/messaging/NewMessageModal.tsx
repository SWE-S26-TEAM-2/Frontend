'use client';

/**
 * src/components/messaging/NewMessageModal.tsx
 *
 * Modal for starting a new conversation.
 * Shows all available users with search filtering.
 * Clicking a user creates or opens the existing conversation and navigates to it.
 * Pure presentational — no business logic beyond filtering.
 */

import { useCallback, useEffect, useMemo, useRef, useState, MouseEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import styles from './NewMessageModal.module.css';
import type { IConversation, IConversationParticipant } from '@/types/messaging.types';

export interface INewMessageModalProps {
  availableUsers: IConversationParticipant[];
  existingConversations: IConversation[];
  onSelectUser: (participant: IConversationParticipant) => Promise<void>;
  onClose: () => void;
  isCreating: boolean;
}

export function NewMessageModal({
  availableUsers,
  existingConversations,
  onSelectUser,
  onClose,
  isCreating,
}: INewMessageModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const existingUserIds = useMemo(
    () => new Set(existingConversations.flatMap((c) => c.participants.map((p) => p.userId))),
    [existingConversations]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return availableUsers;
    return availableUsers.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
    );
  }, [availableUsers, query]);

  const handleOverlayClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="New message">
        <div className={styles.header}>
          <span className={styles.title}>New Message</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.searchWrap}>
          <input
            ref={inputRef}
            className={styles.searchInput}
            type="text"
            placeholder="Search people…"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            disabled={isCreating}
          />
        </div>

        <div className={styles.userList}>
          {filtered.length === 0 && (
            <div className={styles.empty}>No users found</div>
          )}
          {filtered.map((user: IConversationParticipant) => {
            const hasConvo = existingUserIds.has(user.userId);
            return (
              <button
                key={user.userId}
                className={styles.userRow}
                onClick={() => onSelectUser(user)}
                disabled={isCreating}
              >
                <Image
                  src={user.avatarUrl}
                  alt={user.displayName}
                  width={40}
                  height={40}
                  className={styles.avatar}
                  unoptimized
                />
                <div className={styles.userInfo}>
                  <div className={styles.displayName}>{user.displayName}</div>
                  <div className={styles.username}>@{user.username}</div>
                </div>
                {hasConvo && (
                  <span className={styles.alreadyChattingBadge}>Chatting</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
