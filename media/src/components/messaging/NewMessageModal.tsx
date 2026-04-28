'use client';

/**
 * src/components/messaging/NewMessageModal.tsx
 *
 * Modal for starting a new conversation.
 *
 * Mock mode: filters the pre-loaded availableUsers list client-side.
 * Real mode: calls onSearch(query) which triggers a backend /search/users call
 *            and replaces availableUsers with the live results.
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
  /** Optional: when provided, called on each query change for backend search */
  onSearch?: (query: string) => void;
}

export function NewMessageModal({
  availableUsers,
  existingConversations,
  onSelectUser,
  onClose,
  isCreating,
  onSearch,
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

  // When onSearch is provided (real mode) delegate filtering to the parent.
  // When not provided (mock mode) filter the availableUsers list client-side.
  const filtered = useMemo(() => {
    if (onSearch) return availableUsers; // parent already filtered
    const q = query.toLowerCase().trim();
    if (!q) return availableUsers;
    return availableUsers.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
    );
  }, [availableUsers, query, onSearch]);

  const handleQueryChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setQuery(v);
      onSearch?.(v);
    },
    [onSearch]
  );

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
            onChange={handleQueryChange}
            disabled={isCreating}
          />
        </div>

        <div className={styles.userList}>
          {filtered.length === 0 && query.trim() && (
            <div className={styles.empty}>
              {isCreating ? 'Searching…' : 'No users found'}
            </div>
          )}
          {filtered.length === 0 && !query.trim() && onSearch && (
            <div className={styles.empty}>Type a name to search for users</div>
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
