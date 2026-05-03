'use client';

/**
 * src/hooks/useTypingIndicator.ts
 *
 * Polls for typing indicator state from other participants.
 * Debounces the "stop typing" signal after last keystroke.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { messagingService } from '@/services/messaging';
import type { IUseTypingIndicatorReturn } from '@/types/messaging.types';

const POLL_INTERVAL_MS = 1_500;
// Must be significantly longer than poll interval so the entry is guaranteed
// to still be in localStorage when the other tab's next poll fires.
const STOP_TYPING_DELAY_MS = 4_000;

export function useTypingIndicator(conversationId: string): IUseTypingIndicatorReturn {
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [typingUsername, setTypingUsername] = useState<string | null>(null);
  const stopTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // ── Poll for other user's typing state ──────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;

    // Resolve the current user's real ID so we never show our own typing indicator
    const myUserId =
      typeof window !== 'undefined'
        ? (window.localStorage.getItem('auth_user_id') ?? 'current_user')
        : 'current_user';

    const pollAsync = async () => {
      try {
        const indicator = await messagingService.getTypingIndicatorAsync(conversationId);
        if (!isMountedRef.current) return;

        if (indicator && indicator.userId !== myUserId && indicator.isTyping) {
          setIsOtherUserTyping(true);
          setTypingUsername(indicator.username);
        } else {
          setIsOtherUserTyping(false);
          setTypingUsername(null);
        }
      } catch {
        // Silent — typing indicator is non-critical
      }
    };

    // Fire immediately on mount — no 1.5s blind spot on page load
    pollAsync();
    const interval = setInterval(pollAsync, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [conversationId]);

  // ── Notify server of current user's typing state ─────────────────────────────

  const setIsTypingAsync = useCallback(
    async (isTyping: boolean) => {
      // Clear any pending stop-typing timer
      if (stopTypingTimerRef.current !== null) {
        clearTimeout(stopTypingTimerRef.current);
        stopTypingTimerRef.current = null;
      }

      if (isTyping) {
        await messagingService.setTypingAsync({ conversationId, isTyping: true });

        // Auto-stop typing after delay (must be > POLL_INTERVAL_MS so entry is read at least once)
        stopTypingTimerRef.current = setTimeout(async () => {
          try {
            await messagingService.setTypingAsync({ conversationId, isTyping: false });
          } catch {
            // Silent
          }
        }, STOP_TYPING_DELAY_MS);
      } else {
        await messagingService.setTypingAsync({ conversationId, isTyping: false });
      }
    },
    [conversationId]
  );

  // ── Cleanup on unmount ───────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (stopTypingTimerRef.current !== null) {
        clearTimeout(stopTypingTimerRef.current);
      }
      // Best-effort: stop typing on unmount
      messagingService.setTypingAsync({ conversationId, isTyping: false }).catch(() => {});
    };
  }, [conversationId]);

  return { isOtherUserTyping, typingUsername, setIsTypingAsync };
}
