/**
 * src/types/messaging.types.ts
 *
 * Centralized type definitions for the messaging/DM feature.
 * All messaging-related interfaces are declared here.
 */

// ── Message Types ─────────────────────────────────────────────────────────────

export type IMessageType = 'text' | 'track';

export interface IMessageBase {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string;
  timestamp: string; // ISO 8601
  isSeen: boolean;
  type: IMessageType;
}

export interface ITextMessage extends IMessageBase {
  type: 'text';
  content: string;
}

export interface ITrackMessage extends IMessageBase {
  type: 'track';
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  trackCoverUrl: string;
  trackDuration: number; // seconds
}

export type IMessage = ITextMessage | ITrackMessage;

// ── Conversation Types ─────────────────────────────────────────────────────────

export interface IConversationParticipant {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface IConversation {
  id: string;
  participants: IConversationParticipant[];
  lastMessage: IMessage | null;
  unreadCount: number;
  updatedAt: string; // ISO 8601
}

// ── Typing Indicator ───────────────────────────────────────────────────────────

export interface ITypingIndicator {
  conversationId: string;
  userId: string;
  username: string;
  isTyping: boolean;
  updatedAt: string;
}

// ── API Payloads ──────────────────────────────────────────────────────────────

export interface ISendTextMessagePayload {
  conversationId: string;
  type: 'text';
  content: string;
}

export interface ISendTrackMessagePayload {
  conversationId: string;
  type: 'track';
  trackId: string;
  trackTitle: string;
  trackArtist: string;
  trackCoverUrl: string;
  trackDuration: number;
}

export type ISendMessagePayload = ISendTextMessagePayload | ISendTrackMessagePayload;

export interface ISetTypingPayload {
  conversationId: string;
  isTyping: boolean;
}

// ── Service Interface ─────────────────────────────────────────────────────────

export interface IMessagingService {
  getConversationsAsync(): Promise<IConversation[]>;
  getMessagesAsync(conversationId: string): Promise<IMessage[]>;
  sendMessageAsync(payload: ISendMessagePayload): Promise<IMessage>;
  markSeenAsync(conversationId: string, messageId: string): Promise<void>;
  getTypingIndicatorAsync(conversationId: string): Promise<ITypingIndicator | null>;
  setTypingAsync(payload: ISetTypingPayload): Promise<void>;
  createConversationAsync(participant: IConversationParticipant): Promise<IConversation>;
}

// ── Hook Return Types ─────────────────────────────────────────────────────────

export interface IUseConversationsReturn {
  conversations: IConversation[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface IUseMessagesReturn {
  messages: IMessage[];
  isLoading: boolean;
  error: string | null;
  sendTextMessageAsync: (content: string) => Promise<void>;
  sendTrackMessageAsync: (track: Omit<ISendTrackMessagePayload, 'conversationId' | 'type'>) => Promise<void>;
  isSending: boolean;
}

export interface IUseTypingIndicatorReturn {
  isOtherUserTyping: boolean;
  typingUsername: string | null;
  setIsTypingAsync: (isTyping: boolean) => Promise<void>;
}
