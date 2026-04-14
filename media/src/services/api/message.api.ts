import { ENV } from "@/config/env";
import { apiGet, apiPost, apiPatch } from "./apiClient";
import type { IInboxItem, IMessage, IMessageThread, IMessageService } from "@/types/message.types";

const getCurrentUserId = (): string | null =>
  typeof window !== "undefined" ? window.localStorage.getItem("auth_user_id") : null;

// ── Normalizers ──────────────────────────────────────────────────────────────

interface BackendUser {
  user_id: string;
  display_name: string;
  profile_picture?: string | null;
}

interface BackendConversation {
  conversation_id: string;
  user1_id: string;
  user2_id: string;
  user1: BackendUser;
  user2: BackendUser;
  created_at: string;
}

interface BackendMessage {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string | null;
  track_id: string | null;
  track?: { track_id: string; title: string; file_url: string } | null;
  playlist_id: string | null;
  playlist?: { playlist_id: string; name: string } | null;
  is_read: boolean;
  created_at: string;
}

function normalizeConversation(conv: BackendConversation): IInboxItem {
  const meId = getCurrentUserId();
  const other = conv.user1_id === meId ? conv.user2 : conv.user1;
  return {
    threadId: conv.conversation_id,
    participant: {
      id: other.user_id,
      username: other.display_name,
      avatarUrl: other.profile_picture ?? "",
    },
    lastMessage: "",
    lastMessageAt: conv.created_at,
    unreadCount: 0,
  };
}

function normalizeMessage(msg: BackendMessage): IMessage {
  return {
    id: msg.message_id,
    threadId: msg.conversation_id,
    sender: { id: msg.sender_id, username: "", avatarUrl: "" },
    body: msg.content ?? "",
    createdAt: msg.created_at,
    isRead: msg.is_read,
    trackAttachment: msg.track
      ? { id: msg.track_id!, title: msg.track.title, fileUrl: msg.track.file_url }
      : null,
    playlistAttachment: msg.playlist
      ? { id: msg.playlist_id!, name: msg.playlist.name }
      : null,
  };
}

// ── Service ──────────────────────────────────────────────────────────────────

export const realMessageService: IMessageService = {
  // GET /conversations
  getInbox: async (): Promise<IInboxItem[]> => {
    const data = await apiGet<BackendConversation[]>(`${ENV.API_BASE_URL}/conversations`);
    return (Array.isArray(data) ? data : []).map(normalizeConversation);
  },

  // GET /conversations/{id}/messages → build IMessageThread
  getThread: async (conversationId: string): Promise<IMessageThread> => {
    const [inbox, messages] = await Promise.all([
      apiGet<BackendConversation[]>(`${ENV.API_BASE_URL}/conversations`),
      apiGet<BackendMessage[]>(`${ENV.API_BASE_URL}/conversations/${conversationId}/messages`),
    ]);
    const conv = (Array.isArray(inbox) ? inbox : []).find(
      (c: BackendConversation) => c.conversation_id === conversationId
    );
    const meId = getCurrentUserId();
    const other = conv
      ? conv.user1_id === meId ? conv.user2 : conv.user1
      : { user_id: "", display_name: "Unknown", profile_picture: null };

    const normalizedMsgs = (Array.isArray(messages) ? messages : []).map(normalizeMessage);
    const last = normalizedMsgs[normalizedMsgs.length - 1];

    return {
      id: conversationId,
      participant: { id: other.user_id, username: other.display_name, avatarUrl: other.profile_picture ?? "" },
      lastMessage: last?.body ?? "",
      lastMessageAt: last?.createdAt ?? new Date().toISOString(),
      unreadCount: normalizedMsgs.filter((m) => !m.isRead && m.sender.id !== meId).length,
      messages: normalizedMsgs,
    };
  },

  // POST /conversations/{id}/messages
  sendMessage: async (conversationId: string, body: string): Promise<IMessage> => {
    const data = await apiPost<BackendMessage>(
      `${ENV.API_BASE_URL}/conversations/${conversationId}/messages`,
      { content: body }
    );
    return normalizeMessage(data);
  },

  // POST /conversations
  createConversation: async (participantId: string): Promise<{ conversationId: string }> => {
    const data = await apiPost<{ conversation_id: string }>(
      `${ENV.API_BASE_URL}/conversations`,
      { participant_id: participantId }
    );
    return { conversationId: data.conversation_id };
  },

  // PATCH /conversations/{convId}/messages/{msgId}/read
  markMessageRead: async (conversationId: string, messageId: string): Promise<void> => {
    await apiPatch(
      `${ENV.API_BASE_URL}/conversations/${conversationId}/messages/${messageId}/read`
    );
  },
};
