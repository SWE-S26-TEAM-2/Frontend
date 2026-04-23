export interface IMessageUser {
  id: string;
  username: string;
  avatarUrl: string;
}

export interface IMessage {
  id: string;
  threadId: string;
  sender: IMessageUser;
  body: string;
  createdAt: string;
  isRead: boolean;
  trackAttachment?: { id: string; title: string; fileUrl: string } | null;
  playlistAttachment?: { id: string; name: string } | null;
}

export interface IMessageThread {
  id: string;
  participant: IMessageUser; // the other person (not the current user)
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: IMessage[];
}

export interface IInboxItem {
  threadId: string;
  participant: IMessageUser;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface IMessageService {
  getInbox: () => Promise<IInboxItem[]>;
  getThread: (threadId: string) => Promise<IMessageThread>;
  sendMessage: (threadId: string, body: string) => Promise<IMessage>;
  createConversation: (participantId: string) => Promise<{ conversationId: string }>;
  markMessageRead: (conversationId: string, messageId: string) => Promise<void>;
}
