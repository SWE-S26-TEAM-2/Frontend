/**
 * Real messaging API service.
 *
 * Implements IMessagingService using the FastAPI backend.
 *
 * Backend endpoint map:
 *   POST   /conversations                                    → create or get conversation
 *   GET    /conversations                                    → list all user conversations
 *   GET    /conversations/:id/messages                       → list messages (oldest first)
 *   POST   /conversations/:id/messages                       → send a message
 *   PATCH  /conversations/:id/messages/:msgId/read           → mark single message read
 *   PATCH  /conversations/:id/messages/read-all              → mark all read
 *   GET    /conversations/unread-count                       → total unread count
 *
 * Backend response shapes are mapped to the frontend IMessagingService interface.
 * The typing indicator is not supported by the backend — these methods are no-ops.
 * "current_user" identity is resolved from localStorage (auth_user_id).
 */

import { ENV } from "@/config/env";
import { apiGet, apiPost, apiPatch } from "./apiClient";
import type {
  IConversation,
  IConversationParticipant,
  IMessage,
  IMessagingService,
  ISendMessagePayload,
  ISetTypingPayload,
  ITypingIndicator,
} from "@/types/messaging.types";

// ── Backend response shapes ───────────────────────────────────────────────────

interface IBackendParticipant {
  user_id: string;
  display_name: string;
  profile_picture?: string | null;
}

interface IBackendLastMessage {
  content?: string | null;
  sender_id: string;
  created_at?: string | null;
  is_read: boolean;
}

interface IBackendConversation {
  conversation_id: string;
  created_at?: string | null;
  participants: IBackendParticipant[];
  last_message?: IBackendLastMessage | null;
}

interface IBackendMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content?: string | null;
  track_id?: string | null;
  playlist_id?: string | null;
  is_read: boolean;
  created_at?: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Get the logged-in user's ID from localStorage (set by auth flow). */
function getCurrentUserId(): string {
  if (typeof window === "undefined") return "current_user";
  return window.localStorage.getItem("auth_user_id") ?? "current_user";
}

/**
 * Returns a stable random ID for this browser tab, stored in sessionStorage.
 * Each tab gets its own ID even when multiple tabs share the same logged-in user,
 * which lets the typing indicator work in two-tab same-account scenarios.
 */
function getTabId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem("tab_id");
  if (!id) {
    id = `tab_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    sessionStorage.setItem("tab_id", id);
  }
  return id;
}

/** Resolve a participant's avatar — backend stores a URL or null. */
function resolveAvatar(url?: string | null): string {
  return url ?? "https://i.pravatar.cc/150?img=5";
}

/**
 * Normalise a backend conversation into the frontend IConversation shape.
 * The frontend always shows the OTHER participant (not the logged-in user)
 * in the participants array.
 */
function normalizeConversation(c: IBackendConversation): IConversation {
  const myId = getCurrentUserId();

  // Filter to only the other participant(s)
  const others = c.participants.filter((p) => p.user_id !== myId);
  const participants: IConversationParticipant[] = others.map((p) => ({
    userId: p.user_id,
    username: p.display_name.toLowerCase().replace(/\s+/g, ""),
    displayName: p.display_name,
    avatarUrl: resolveAvatar(p.profile_picture),
  }));

  // If no other found (edge case), fall back to first participant
  if (participants.length === 0 && c.participants.length > 0) {
    const p = c.participants[0];
    participants.push({
      userId: p.user_id,
      username: p.display_name.toLowerCase().replace(/\s+/g, ""),
      displayName: p.display_name,
      avatarUrl: resolveAvatar(p.profile_picture),
    });
  }

  // Build lastMessage — backend only gives us text content in the list
  let lastMessage: IMessage | null = null;
  if (c.last_message) {
    const lm = c.last_message;
    lastMessage = {
      id: `last_${c.conversation_id}`,
      conversationId: c.conversation_id,
      senderId: lm.sender_id,
      senderName: lm.sender_id === myId ? "You" : (participants[0]?.displayName ?? ""),
      senderAvatarUrl: lm.sender_id === myId
        ? resolveAvatar(null)
        : (participants[0]?.avatarUrl ?? resolveAvatar(null)),
      timestamp: lm.created_at ?? c.created_at ?? new Date().toISOString(),
      isSeen: lm.is_read,
      type: "text",
      content: lm.content ?? "",
    };
  }

  return {
    id: c.conversation_id,
    participants,
    lastMessage,
    unreadCount: 0, // resolved separately from unread-count endpoint
    updatedAt: lastMessage?.timestamp ?? c.created_at ?? new Date().toISOString(),
  };
}

/** Normalise a backend message into IMessage. */
function normalizeMessage(m: IBackendMessage, conversationId: string): IMessage {
  const myId = getCurrentUserId();
  const isOwn = m.sender_id === myId;

  const base = {
    id: m.id,
    conversationId,
    senderId: isOwn ? "current_user" : m.sender_id,
    senderName: isOwn ? "You" : m.sender_id,
    senderAvatarUrl: resolveAvatar(null),
    timestamp: m.created_at ?? new Date().toISOString(),
    isSeen: m.is_read,
  };

  // Track-share message
  if (m.track_id) {
    return {
      ...base,
      type: "track",
      trackId: m.track_id,
      trackTitle: "Shared Track",
      trackArtist: "",
      trackCoverUrl: "",
      trackDuration: 0,
    };
  }

  // Plain text message
  return {
    ...base,
    type: "text",
    content: m.content ?? "",
  };
}

// ── Service implementation ────────────────────────────────────────────────────

export const realMessagingService: IMessagingService = {
  /** GET /conversations — returns all conversations newest-first */
  async getConversationsAsync(): Promise<IConversation[]> {
    const data = await apiGet<IBackendConversation[]>(
      `${ENV.API_BASE_URL}/conversations`
    );
    const conversations = (Array.isArray(data) ? data : []).map(normalizeConversation);

    // Fetch unread count and distribute across conversations
    try {
      const unreadData = await apiGet<{ unread_count: number }>(
        `${ENV.API_BASE_URL}/conversations/unread-count`
      );
      // Backend returns total; we mark all as potentially unread conservatively —
      // the real per-conversation count requires reading each message list which
      // would be too expensive here. Set to 0 for now and let messages page handle it.
      void unreadData;
    } catch {
      // Non-critical — ignore
    }

    return conversations;
  },

  /** GET /conversations/:id/messages */
  async getMessagesAsync(conversationId: string): Promise<IMessage[]> {
    const data = await apiGet<IBackendMessage[]>(
      `${ENV.API_BASE_URL}/conversations/${conversationId}/messages`
    );
    return (Array.isArray(data) ? data : []).map((m) =>
      normalizeMessage(m, conversationId)
    );
  },

  /** POST /conversations/:id/messages */
  async sendMessageAsync(payload: ISendMessagePayload): Promise<IMessage> {
    const body: Record<string, unknown> = {};

    if (payload.type === "text") {
      body.content = payload.content;
    } else if (payload.type === "track") {
      // Backend accepts track_id as an optional field alongside content
      body.track_id = payload.trackId;
      // Provide a minimal content fallback so the at-least-one-field validator passes
      body.content = `Shared track: ${payload.trackTitle}`;
    }

    const data = await apiPost<IBackendMessage>(
      `${ENV.API_BASE_URL}/conversations/${payload.conversationId}/messages`,
      body
    );

    const msg = normalizeMessage(data, payload.conversationId);

    // Re-apply track metadata from the payload since the backend message
    // only stores track_id, not the full track details
    if (payload.type === "track" && msg.type === "track") {
      msg.trackTitle = payload.trackTitle;
      msg.trackArtist = payload.trackArtist;
      msg.trackCoverUrl = payload.trackCoverUrl;
      msg.trackDuration = payload.trackDuration;
    }

    return msg;
  },

  /** PATCH /conversations/:id/messages/read-all (marks all as read for current user) */
  async markSeenAsync(conversationId: string, _messageId: string): Promise<void> {
    try {
      await apiPatch(
        `${ENV.API_BASE_URL}/conversations/${conversationId}/messages/read-all`
      );
    } catch {
      // Non-critical — ignore
    }
  },

  /**
   * Typing indicators are not supported by the backend.
   * We simulate them client-side using localStorage so the indicator
   * works within the same browser (including two tabs of the same account).
   *
   * Storage key: `typing:<conversationId>:<tabId>`
   *   - tabId is a random ID generated once per tab (sessionStorage),
   *     so two tabs of the same user are treated as distinct writers.
   *
   * Value: JSON { isTyping: boolean, username: string, userId: string, timestamp: number }
   * Entries expire after 3 seconds of inactivity.
   */
  async getTypingIndicatorAsync(
    conversationId: string
  ): Promise<ITypingIndicator | null> {
    if (typeof window === "undefined") return null;
    const myTabId = getTabId();
    const EXPIRY_MS = 3000;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(`typing:${conversationId}:`)) continue;

      // Skip entries written by THIS tab
      const keyTabId = key.split(":")[2];
      if (keyTabId === myTabId) continue;

      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const entry = JSON.parse(raw) as {
          isTyping: boolean;
          username: string;
          userId: string;
          timestamp: number;
        };

        // Expire stale entries
        if (Date.now() - entry.timestamp > EXPIRY_MS) {
          localStorage.removeItem(key);
          continue;
        }

        if (entry.isTyping) {
          return {
            conversationId,
            userId: entry.userId,
            username: entry.username,
            isTyping: true,
            updatedAt: new Date(entry.timestamp).toISOString(),
          };
        }
      } catch {
        if (key) localStorage.removeItem(key);
      }
    }
    return null;
  },

  /** Persists this tab's typing state to localStorage. */
  async setTypingAsync(payload: ISetTypingPayload): Promise<void> {
    if (typeof window === "undefined") return;
    const myTabId = getTabId();
    const key = `typing:${payload.conversationId}:${myTabId}`;

    if (payload.isTyping) {
      const username =
        localStorage.getItem("auth_username") ??
        localStorage.getItem("auth_display_name") ??
        "Someone";
      const userId = getCurrentUserId();
      localStorage.setItem(
        key,
        JSON.stringify({ isTyping: true, username, userId, timestamp: Date.now() })
      );
    } else {
      localStorage.removeItem(key);
    }
  },

  /**
   * POST /conversations
   * Body: { username }  ← backend expects the username string, not a UUID
   * Idempotent — returns existing conversation if one already exists.
   */
  async createConversationAsync(
    participant: IConversationParticipant
  ): Promise<IConversation> {
    const data = await apiPost<{ conversation_id: string }>(
      `${ENV.API_BASE_URL}/conversations`,
      { username: participant.username }
    );

    return {
      id: data.conversation_id,
      participants: [participant],
      lastMessage: null,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };
  },
};
