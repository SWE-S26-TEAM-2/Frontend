'use client';

/**
 * src/app/(with-header)/messages/[id]/page.tsx
 *
 * DM conversation view.
 *
 * Features:
 *  - Message list with text + track messages
 *  - Send text messages (optimistic UI)
 *  - Send track messages via 🎵 picker button
 *  - Auto-scroll to bottom on new messages
 *  - Polling every 3s for bot replies
 *  - Typing indicator (bot simulates typing before replying)
 *  - Seen status ✓ / ✓✓ on own messages
 *  - Input bar sits above the fixed footer player (no overlap)
 */

import { use, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Conversation.module.css';
import { useMessages } from '@/hooks/useMessages';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useConversations } from '@/hooks/useConversations';
import { ChatHeader } from '@/components/messaging/ChatHeader';
import { MessageBubble } from '@/components/messaging/MessageBubble';
import { TrackMessage } from '@/components/messaging/TrackMessage';
import { MessageInput } from '@/components/messaging/MessageInput';
import { groupMessagesBySender } from '@/utils/messagingUtils';
import { mockTrackService } from '@/services/mocks/trackService';
import type { IMessage, ITextMessage, ITrackMessage } from '@/types/messaging.types';
import type { ITrack } from '@/types/track.types';

interface IPageProps {
  params: Promise<{ id: string }>;
}

export default function ConversationPage({ params }: IPageProps) {
  const { id: conversationId } = use(params);
  const router = useRouter();

  // ── Data ────────────────────────────────────────────────────────────────────

  const { conversations } = useConversations();
  const {
    messages,
    isLoading,
    error,
    sendTextMessageAsync,
    sendTrackMessageAsync,
    isSending,
  } = useMessages(conversationId);
  const { isOtherUserTyping, typingUsername, setIsTypingAsync } =
    useTypingIndicator(conversationId);

  // ── Tracks for picker ────────────────────────────────────────────────────────

  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);

  useEffect(() => {
    mockTrackService.getAll().then((data) => {
      setTracks(data);
      setIsLoadingTracks(false);
    }).catch(() => setIsLoadingTracks(false));
  }, []);

  // ── UI state ─────────────────────────────────────────────────────────────────

  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Find participant info
  const conversation = conversations.find((c) => c.id === conversationId) ?? null;
  const participant = conversation?.participants[0] ?? null;

  // Redirect to inbox if conversation ID is unknown after conversations load
  useEffect(() => {
    if (!isLoading && conversations.length > 0 && !conversation) {
      router.replace('/messages');
    }
  }, [isLoading, conversations.length, conversation, router]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────────

  // Smooth scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isOtherUserTyping]);

  // Instant scroll on initial load
  const hasScrolledInitially = useRef(false);
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !hasScrolledInitially.current) {
      hasScrolledInitially.current = true;
      bottomRef.current?.scrollIntoView();
    }
  }, [isLoading, messages.length]);

  // ── Send handlers ────────────────────────────────────────────────────────────

  const handleSendText = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setInputValue('');
    await setIsTypingAsync(false);
    await sendTextMessageAsync(trimmed);
  }, [inputValue, sendTextMessageAsync, setIsTypingAsync]);

  const handleSendTrack = useCallback(
    async (track: ITrack) => {
      await sendTrackMessageAsync({
        trackId: track.id,
        trackTitle: track.title,
        trackArtist: track.artist,
        trackCoverUrl: track.albumArt,
        trackDuration: track.duration,
      });
    },
    [sendTrackMessageAsync]
  );

  const handleTyping = useCallback(() => {
    setIsTypingAsync(true);
  }, [setIsTypingAsync]);

  // ── Group messages by sender ─────────────────────────────────────────────────

  const groups = groupMessagesBySender(messages);

  // ── Render a single message ──────────────────────────────────────────────────

  function renderMessage(msg: IMessage, isGroupEnd: boolean, showAvatar: boolean) {
    if (msg.type === 'track') {
      return (
        <TrackMessage
          key={msg.id}
          message={msg as ITrackMessage}
          showAvatar={isGroupEnd && showAvatar}
        />
      );
    }
    return (
      <MessageBubble
        key={msg.id}
        message={msg as ITextMessage}
        isGroupEnd={isGroupEnd}
        showAvatar={showAvatar}
      />
    );
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={styles.page}>
        <ChatHeader participant={participant} />
        <div className={styles.loadingArea}>
          <div className={styles.skeletonMsg}>
            <div className={styles.skeletonAvatar} />
            <div className={`${styles.skeletonBubble} ${styles.wide}`} />
          </div>
          <div className={`${styles.skeletonMsg} ${styles.own}`}>
            <div className={`${styles.skeletonBubble} ${styles.medium}`} />
          </div>
          <div className={styles.skeletonMsg}>
            <div className={styles.skeletonAvatar} />
            <div className={`${styles.skeletonBubble} ${styles.narrow}`} />
          </div>
          <div className={`${styles.skeletonMsg} ${styles.own}`}>
            <div className={`${styles.skeletonBubble} ${styles.wide}`} />
          </div>
        </div>
        <div className={styles.inputArea}>
          <MessageInput
            value=""
            onChange={() => {}}
            onSend={() => {}}
            onSendTrack={() => {}}
            tracks={[]}
            isLoadingTracks
            disabled
          />
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className={styles.page}>
        <ChatHeader participant={participant} />
        <div className={styles.error}>Failed to load messages</div>
        <div className={styles.inputArea}>
          <MessageInput
            value=""
            onChange={() => {}}
            onSend={() => {}}
            onSendTrack={() => {}}
            tracks={[]}
            isLoadingTracks={false}
            disabled
          />
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <ChatHeader participant={participant} />

      <div className={styles.messagesArea}>
        {messages.length === 0 && (
          <div className={styles.emptyMessages}>
            <div className={styles.emptyIcon}>👋</div>
            <div className={styles.emptyText}>
              Say hi to {participant?.displayName ?? 'them'}!
            </div>
          </div>
        )}

        {groups.map((group, gi) => (
          <div key={`group-${gi}`} className={styles.messageGroup}>
            {group.map((msg, mi) => {
              const isGroupEnd = mi === group.length - 1;
              const showAvatar = msg.senderId !== 'current_user';
              return renderMessage(msg, isGroupEnd, showAvatar);
            })}
          </div>
        ))}

        {/* Typing indicator */}
        <div className={styles.typingIndicator}>
          {isOtherUserTyping && (
            <>
              <div className={styles.typingDots}>
                <div className={styles.typingDot} />
                <div className={styles.typingDot} />
                <div className={styles.typingDot} />
              </div>
              <span>{typingUsername ?? 'User'} is typing…</span>
            </>
          )}
        </div>

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendText}
          onSendTrack={handleSendTrack}
          onTyping={handleTyping}
          tracks={tracks}
          isLoadingTracks={isLoadingTracks}
          disabled={isSending}
          placeholder={`Message ${participant?.displayName ?? ''}…`}
        />
      </div>
    </div>
  );
}
