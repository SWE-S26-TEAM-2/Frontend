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

interface BackendParticipant {
  user_id: string;
  display_name: string;
  profile_picture?: string | null;
}

interface BackendLastMessage {
  content?: string | null;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface BackendConversation {
  conversation_id: string;
  created_at: string;
  participants: BackendParticipant[];
  last_message?: BackendLastMessage | null;
}

interface BackendMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content?: string | null;
  track_id?: string | null;
  playlist_id?: string | null;
  is_read: boolean;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Get the logged-in user's ID from localStorage (set by auth flow). */
function getCurrentUserId(): string {
  if (typeof window === "undefined") return "current_user";
  return window.localStorage.getItem("auth_user_id") ?? "current_user";
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
function normalizeConversation(c: BackendConversation): IConversation {
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
      timestamp: lm.created_at,
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
    updatedAt: c.created_at,
  };
}

/** Normalise a backend message into IMessage. */
function normalizeMessage(m: BackendMessage, conversationId: string): IMessage {
  const myId = getCurrentUserId();
  const isOwn = m.sender_id === myId;

  const base = {
    id: m.id,
    conversationId,
    senderId: isOwn ? "current_user" : m.sender_id,
    senderName: isOwn ? "You" : m.sender_id,
    senderAvatarUrl: resolveAvatar(null),
    timestamp: m.created_at,
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
    const data = await apiGet<BackendConversation[]>(
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
    const data = await apiGet<BackendMessage[]>(
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

    const data = await apiPost<BackendMessage>(
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
   * Typing indicators are not implemented in the backend.
   * Return null so the frontend shows no typing indicator.
   */
  async getTypingIndicatorAsync(
    _conversationId: string
  ): Promise<ITypingIndicator | null> {
    return null;
  },

  /** No-op — backend has no typing indicator endpoint */
  async setTypingAsync(_payload: ISetTypingPayload): Promise<void> {
    // No-op
  },

  /**
   * POST /conversations
   * Body: { participant_id }
   * Idempotent — returns existing conversation if one already exists.
   */
  async createConversationAsync(
    participant: IConversationParticipant
  ): Promise<IConversation> {
    const data = await apiPost<{ conversation_id: string }>(
      `${ENV.API_BASE_URL}/conversations`,
      { participant_id: participant.userId }
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
