'use client';

/**
 * src/components/messaging/ChatHeader.tsx
 *
 * Sticky header shown at the top of a DM conversation.
 * Shows other participant's avatar, name, and a back button.
 * Pure presentational — no business logic.
 */

import Link from 'next/link';
import Image from 'next/image';
import styles from './ChatHeader.module.css';
import type { IConversationParticipant } from '@/types/messaging.types';

export interface IChatHeaderProps {
  participant: IConversationParticipant | null;
}

export function ChatHeader({ participant }: IChatHeaderProps) {
  return (
    <div className={styles.header}>
      <Link href="/messages" className={styles.backBtn} aria-label="Back to inbox">
        ‹
      </Link>

      {participant?.avatarUrl ? (
        <Image
          src={participant.avatarUrl}
          alt={participant.displayName}
          width={38}
          height={38}
          className={styles.avatar}
          unoptimized
        />
      ) : (
        <div className={styles.avatarFallback}>
          {participant?.displayName?.charAt(0) ?? '?'}
        </div>
      )}

      <div className={styles.info}>
        <div className={styles.name}>{participant?.displayName ?? 'Unknown'}</div>
        {participant?.username && (
          <div className={styles.username}>@{participant.username}</div>
        )}
      </div>
    </div>
  );
}
