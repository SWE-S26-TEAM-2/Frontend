'use client';

/**
 * src/app/(with-header)/messages/page.tsx
 *
 * Messaging inbox — lists all conversations with last message preview,
 * unread counts, and auto-syncs every 5 seconds.
 *
 * "New Message" button opens a modal. User search hits /search/users endpoint.
 */

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Inbox.module.css';
import { useConversations } from '@/hooks/useConversations';
import { ConversationItem } from '@/components/messaging/ConversationItem';
import { NewMessageModal } from '@/components/messaging/NewMessageModal';
import { messagingService } from '@/services/messaging';
import { ENV } from '@/config/env';
import { apiGet } from '@/services/api/apiClient';
import type { IConversationParticipant } from '@/types/messaging.types';

// ── Backend user search response shape ──────────────────────────────────────
interface BackendSearchUser {
  user_id: string;
  display_name: string;
  profile_picture?: string | null;
}

export default function MessagesPage() {
  const router = useRouter();
  const { conversations, isLoading, error, refresh } = useConversations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Live search results from backend
  const [searchResults, setSearchResults] = useState<IConversationParticipant[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  // ── User search via backend ─────────────────────────────────────────────────
  const handleUserSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const data = await apiGet<{ users: BackendSearchUser[] }>(
        `${ENV.API_BASE_URL}/search/users?keyword=${encodeURIComponent(query.trim())}`
      );
      const users: IConversationParticipant[] = (data.users ?? []).map((u) => ({
        userId: u.user_id,
        username: u.display_name.toLowerCase().replace(/\s+/g, ''),
        displayName: u.display_name,
        avatarUrl: u.profile_picture ?? 'https://i.pravatar.cc/150?img=5',
      }));
      setSearchResults(users);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // ── Create or navigate to conversation ─────────────────────────────────────
  const handleSelectUser = useCallback(
    async (participant: IConversationParticipant) => {
      setIsCreating(true);
      try {
        const conv = await messagingService.createConversationAsync(participant);
        setIsModalOpen(false);
        refresh();
        router.push(`/messages/${conv.id}`);
      } catch {
        // silent — modal stays open
      } finally {
        setIsCreating(false);
      }
    },
    [router, refresh]
  );

  const handleOpenModal = useCallback(() => {
    setSearchResults([]);
    setIsModalOpen(true);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Messages</h1>
            {!isLoading && totalUnread > 0 && (
              <span className={styles.totalUnread}>{totalUnread} unread</span>
            )}
          </div>
          <button
            className={styles.newMessageBtn}
            onClick={handleOpenModal}
          >
            <span className={styles.newMessageIcon}>✏</span>
            New Message
          </button>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className={styles.loading}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonRow}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonBody}>
                  <div className={`${styles.skeletonLine} ${styles.short}`} />
                  <div className={`${styles.skeletonLine} ${styles.shorter}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className={styles.list}>
            <div className={styles.error}>
              Failed to load conversations
              <br />
              <button className={styles.retryBtn} onClick={refresh}>
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && conversations.length === 0 && (
          <div className={styles.list}>
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>💬</div>
              <div className={styles.emptyText}>No conversations yet</div>
              <div className={styles.emptyHint}>Hit &quot;New Message&quot; to start one</div>
            </div>
          </div>
        )}

        {/* Conversation list */}
        {!isLoading && !error && conversations.length > 0 && (
          <div className={styles.list}>
            {conversations.map((conv) => (
              <ConversationItem key={conv.id} conversation={conv} />
            ))}
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {isModalOpen && (
        <NewMessageModal
          availableUsers={searchResults}
          existingConversations={conversations}
          onSelectUser={handleSelectUser}
          onClose={() => setIsModalOpen(false)}
          isCreating={isCreating || isSearching}
          onSearch={handleUserSearch}
        />
      )}
    </div>
  );
}
