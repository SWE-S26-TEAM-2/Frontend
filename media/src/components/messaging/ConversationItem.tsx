'use client';

/**
 * src/components/messaging/ConversationItem.tsx
 *
 * Renders a single row in the inbox conversation list.
 * Pure presentational — no business logic.
 */

import Link from 'next/link';
import Image from 'next/image';
import styles from './ConversationItem.module.css';
import type { IConversation } from '@/types/messaging.types';
import { formatConversationTime } from '@/utils/messagingUtils';

export interface IConversationItemProps {
  conversation: IConversation;
  isActive?: boolean;
}

export function ConversationItem({ conversation, isActive = false }: IConversationItemProps) {
  const { id, participants, lastMessage, unreadCount } = conversation;
  const other = participants[0];
  const hasUnread = unreadCount > 0;

  const previewText = lastMessage
    ? lastMessage.type === 'track'
      ? `🎵 ${lastMessage.trackTitle}`
      : lastMessage.type === 'text'
      ? lastMessage.content
      : ''
    : 'No messages yet';

  const timeLabel = lastMessage
    ? formatConversationTime(lastMessage.timestamp)
    : '';

  return (
    <Link
      href={`/messages/${id}`}
      className={`${styles.item} ${isActive ? styles.active : ''}`}
    >
      <div className={styles.avatarWrap}>
        {other?.avatarUrl ? (
          <Image
            src={other.avatarUrl}
            alt={other.displayName}
            width={46}
            height={46}
            className={styles.avatar}
            unoptimized
          />
        ) : (
          <div className={styles.avatarFallback}>
            {other?.displayName?.charAt(0) ?? '?'}
          </div>
        )}
        {hasUnread && <span className={styles.unreadDot} />}
      </div>

      <div className={styles.body}>
        <div className={styles.nameRow}>
          <span className={`${styles.name} ${hasUnread ? styles.unread : ''}`}>
            {other?.displayName ?? 'Unknown User'}
          </span>
          {timeLabel && <span className={styles.time}>{timeLabel}</span>}
        </div>
        <div className={styles.previewRow}>
          <span className={`${styles.preview} ${hasUnread ? styles.unread : ''}`}>
            {previewText}
          </span>
          {hasUnread && (
            <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
