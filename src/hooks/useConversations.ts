'use client';

/**
 * src/hooks/useConversations.ts
 *
 * Fetches and auto-syncs the inbox conversation list.
 * Polls every 5 seconds. Deduplicates via Map keyed on conversation id.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { messagingService } from '@/services/messaging';
import type { IConversation, IUseConversationsReturn } from '@/types/messaging.types';

const POLL_INTERVAL_MS = 5_000;

export function useConversations(): IUseConversationsReturn {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const fetchAsync = useCallback(async () => {
    try {
      const data = await messagingService.getConversationsAsync();
      if (!isMountedRef.current) return;

      setConversations((prev: IConversation[]) => {
        // Merge server data; preserve optimistic (temp_*) conversations not yet confirmed
        const map = new Map<string, IConversation>();
        for (const conv of data) {
          map.set(conv.id, conv);
        }
        for (const conv of prev) {
          if (conv.id.startsWith('temp_') && !map.has(conv.id)) {
            map.set(conv.id, conv);
          }
        }
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    void fetchAsync();
  }, [fetchAsync]);

  /** Optimistically add a conversation before the API call completes */
  const addOptimisticConversation = useCallback((conv: IConversation) => {
    setConversations((prev: IConversation[]) => {
      if (prev.some((c) => c.id === conv.id)) return prev;
      return [conv, ...prev];
    });
  }, []);

  /** Replace a temp conversation with a confirmed one (or remove on failure) */
  const resolveOptimisticConversation = useCallback(
    (tempId: string, confirmed: IConversation | null) => {
      setConversations((prev: IConversation[]) => {
        if (!confirmed) return prev.filter((c) => c.id !== tempId);
        return prev.map((c) => (c.id === tempId ? confirmed : c));
      });
    },
    []
  );

  useEffect(() => {
    isMountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAsync();

    intervalRef.current = setInterval(fetchAsync, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAsync]);

  return {
    conversations,
    isLoading,
    error,
    refresh,
    addOptimisticConversation,
    resolveOptimisticConversation,
  };
}
