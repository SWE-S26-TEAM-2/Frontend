'use client';

/**
 * src/app/(with-header)/messages/page.tsx
 *
 * Messaging inbox — lists all conversations with last message preview,
 * unread counts, and auto-syncs every 5 seconds.
 * "New Message" button opens a modal to start a fresh conversation.
 */

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Inbox.module.css';
import { useConversations } from '@/hooks/useConversations';
import { ConversationItem } from '@/components/messaging/ConversationItem';
import { NewMessageModal } from '@/components/messaging/NewMessageModal';
import { messagingService, AVAILABLE_USERS } from '@/services/messagingService';
import type { IConversationParticipant } from '@/types/messaging.types';

export default function MessagesPage() {
  const router = useRouter();
  const { conversations, isLoading, error, refresh } = useConversations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

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
            onClick={() => setIsModalOpen(true)}
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
          availableUsers={AVAILABLE_USERS}
          existingConversations={conversations}
          onSelectUser={handleSelectUser}
          onClose={() => setIsModalOpen(false)}
          isCreating={isCreating}
        />
      )}
    </div>
  );
}
