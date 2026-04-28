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

      // Deduplicate: last-write-wins by id
      const map = new Map<string, IConversation>();
      for (const conv of data) {
        map.set(conv.id, conv);
      }

      setConversations(Array.from(map.values()));
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
    fetchAsync();
  }, [fetchAsync]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchAsync();

    intervalRef.current = setInterval(fetchAsync, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAsync]);

  return { conversations, isLoading, error, refresh };
}
