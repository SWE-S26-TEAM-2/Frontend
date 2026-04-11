'use client';

/**
 * src/hooks/useMessages.ts
 *
 * Fetches messages for a single conversation and handles sends.
 * - Polls every 3 seconds
 * - Optimistic UI: temp message added immediately, replaced on success, removed on failure
 * - Deduplicates via Map keyed on message id
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { messagingService } from '@/services/messagingService';
import type {
  IMessage,
  ISendTrackMessagePayload,
  IUseMessagesReturn,
} from '@/types/messaging.types';

const POLL_INTERVAL_MS = 3_000;

export function useMessages(conversationId: string): IUseMessagesReturn {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // ── Fetch & deduplicate ──────────────────────────────────────────────────────

  const fetchAsync = useCallback(async () => {
    try {
      const data = await messagingService.getMessagesAsync(conversationId);
      if (!isMountedRef.current) return;

      setMessages((prev: IMessage[]) => {
        // Preserve optimistic (temp_*) messages that haven't been confirmed yet
        const map = new Map<string, IMessage>();
        for (const msg of data) {
          map.set(msg.id, msg);
        }
        // Re-add any optimistic messages not yet in server data
        for (const msg of prev) {
          if (msg.id.startsWith('temp_') && !map.has(msg.id)) {
            map.set(msg.id, msg);
          }
        }
        return Array.from(map.values()).sort(
          (a: IMessage, b: IMessage) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    isMountedRef.current = true;
    setIsLoading(true);
    fetchAsync();

    intervalRef.current = setInterval(fetchAsync, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [fetchAsync]);

  // ── Mark seen on mount ───────────────────────────────────────────────────────

  useEffect(() => {
    const markLatestSeen = async () => {
      const msgs = await messagingService.getMessagesAsync(conversationId);
      const last = msgs[msgs.length - 1];
      if (last && last.senderId !== 'current_user' && !last.isSeen) {
        await messagingService.markSeenAsync(conversationId, last.id);
      }
    };
    markLatestSeen().catch(() => {});
  }, [conversationId]);

  // ── Send text message (optimistic) ──────────────────────────────────────────

  const sendTextMessageAsync = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      setIsSending(true);

      const tempId = `temp_${Date.now()}`;
      const optimisticMsg: IMessage = {
        id: tempId,
        conversationId,
        senderId: 'current_user',
        senderName: 'You',
        senderAvatarUrl: 'https://i.pravatar.cc/150?img=5',
        timestamp: new Date().toISOString(),
        isSeen: false,
        type: 'text',
        content,
      };

      // Add optimistic message
      setMessages((prev: IMessage[]) => [...prev, optimisticMsg]);

      try {
        const confirmed = await messagingService.sendMessageAsync({
          conversationId,
          type: 'text',
          content,
        });

        if (!isMountedRef.current) return;

        // Replace temp with confirmed
        setMessages((prev: IMessage[]) =>
          prev.map((m: IMessage) => (m.id === tempId ? confirmed : m))
        );
      } catch (err) {
        if (!isMountedRef.current) return;
        // Remove failed optimistic message
        setMessages((prev: IMessage[]) => prev.filter((m: IMessage) => m.id !== tempId));
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        if (isMountedRef.current) setIsSending(false);
      }
    },
    [conversationId]
  );

  // ── Send track message (optimistic) ─────────────────────────────────────────

  const sendTrackMessageAsync = useCallback(
    async (track: Omit<ISendTrackMessagePayload, 'conversationId' | 'type'>) => {
      setIsSending(true);

      const tempId = `temp_${Date.now()}`;
      const optimisticMsg: IMessage = {
        id: tempId,
        conversationId,
        senderId: 'current_user',
        senderName: 'You',
        senderAvatarUrl: 'https://i.pravatar.cc/150?img=5',
        timestamp: new Date().toISOString(),
        isSeen: false,
        type: 'track',
        ...track,
      };

      setMessages((prev: IMessage[]) => [...prev, optimisticMsg]);

      try {
        const confirmed = await messagingService.sendMessageAsync({
          conversationId,
          type: 'track',
          ...track,
        });

        if (!isMountedRef.current) return;

        setMessages((prev: IMessage[]) =>
          prev.map((m: IMessage) => (m.id === tempId ? confirmed : m))
        );
      } catch (err) {
        if (!isMountedRef.current) return;
        setMessages((prev: IMessage[]) => prev.filter((m: IMessage) => m.id !== tempId));
        setError(err instanceof Error ? err.message : 'Failed to send track');
      } finally {
        if (isMountedRef.current) setIsSending(false);
      }
    },
    [conversationId]
  );

  return {
    messages,
    isLoading,
    error,
    sendTextMessageAsync,
    sendTrackMessageAsync,
    isSending,
  };
}
