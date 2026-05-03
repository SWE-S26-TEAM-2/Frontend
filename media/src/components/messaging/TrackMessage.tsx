'use client';

/**
 * src/components/messaging/TrackMessage.tsx
 *
 * Renders a track-type message as a clickable mini track card.
 * Click navigates to /track/[id].
 * Pure presentational — no business logic.
 */

import Link from 'next/link';
import Image from 'next/image';
import styles from './TrackMessage.module.css';
import type { ITrackMessage } from '@/types/messaging.types';
import { formatMessageTime, formatTrackDuration } from '@/utils/messagingUtils';

export interface ITrackMessageProps {
  message: ITrackMessage;
  showAvatar?: boolean;
}

export function TrackMessage({ message, showAvatar = true }: ITrackMessageProps) {
  const isOwn = message.senderId === 'current_user';

  return (
    <div className={`${styles.wrapper} ${isOwn ? styles.own : ''}`}>
      {/* Avatar spacer */}
      {!isOwn && showAvatar ? (
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
      )}

      <div>
        <Link href={`/track/${message.trackId}`} className={styles.card}>
          <div className={styles.coverWrap}>
            <Image
              src={message.trackCoverUrl}
              alt={message.trackTitle}
              fill
              className={styles.cover}
              unoptimized
            />
            <div className={styles.playOverlay}>
              <div className={styles.playIcon}>▶</div>
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.title}>{message.trackTitle}</div>
            <div className={styles.artist}>
              {message.trackArtist}
              <span className={styles.duration}>
                {formatTrackDuration(message.trackDuration)}
              </span>
            </div>
          </div>
        </Link>

        <div className={styles.meta}>
          <span className={styles.time}>{formatMessageTime(message.timestamp)}</span>
          {isOwn && (
            <span className={`${styles.seenStatus} ${message.isSeen ? styles.seen : ''}`}>
              {message.isSeen ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
