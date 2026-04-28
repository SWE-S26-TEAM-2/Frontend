'use client';

/**
 * src/components/messaging/MessageBubble.tsx
 *
 * Renders a single text message bubble.
 * - Bubble width fits content (short messages = narrow bubble)
 * - Own messages: accent colour, right-aligned
 * - Other messages: surface colour, left-aligned with avatar
 * - Seen status ✓ / ✓✓ shown on own messages at group end
 */

import Image from 'next/image';
import styles from './MessageBubble.module.css';
import type { ITextMessage } from '@/types/messaging.types';
import { formatMessageTime } from '@/utils/messagingUtils';

export interface IMessageBubbleProps {
  message: ITextMessage;
  isGroupEnd?: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({
  message,
  isGroupEnd = true,
  showAvatar = true,
}: IMessageBubbleProps) {
  const isOwn = message.senderId === 'current_user';

  return (
    <div className={`${styles.wrapper} ${isOwn ? styles.own : ''}`}>
      {/* Avatar / spacer */}
      {!isOwn && showAvatar ? (
        isGroupEnd ? (
          <Image
            src={message.senderAvatarUrl}
            alt={message.senderName}
            width={28}
            height={28}
            className={styles.avatar}
            unoptimized
          />
        ) : (
          <div className={styles.avatarSpacer} />
        )
      ) : (
        <div className={styles.avatarSpacer} />
      )}

      {/* Bubble + meta wrapped together so meta aligns under bubble */}
      <div className={styles.bubbleWrap}>
        <div className={`${styles.bubble} ${isGroupEnd ? styles.groupEnd : ''}`}>
          {message.content}
        </div>

        {isGroupEnd && (
          <div className={styles.meta}>
            <span className={styles.time}>
              {formatMessageTime(message.timestamp)}
            </span>
            {isOwn && (
              <span
                className={`${styles.seenStatus} ${message.isSeen ? styles.seen : ''}`}
              >
                {message.isSeen ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
