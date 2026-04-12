import { MOCK_INBOX, MOCK_THREADS, MOCK_USERS } from "./mockData";
import type { IInboxItem, IMessage, IMessageThread, IMessageService } from "@/types/message.types";

let threadStore = MOCK_THREADS.map((t) => ({ ...t, messages: [...t.messages] }));

export const mockMessageService: IMessageService = {
  getInbox: async (): Promise<IInboxItem[]> => {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_INBOX;
  },

  getThread: async (threadId: string): Promise<IMessageThread> => {
    await new Promise((r) => setTimeout(r, 250));
    const thread = threadStore.find((t) => t.id === threadId);
    if (!thread) throw new Error(`Thread ${threadId} not found`);
    return thread;
  },

  sendMessage: async (threadId: string, body: string): Promise<IMessage> => {
    await new Promise((r) => setTimeout(r, 400));
    const newMsg: IMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      sender: MOCK_USERS.soundwave, // current user placeholder
      body,
      createdAt: new Date().toISOString(),
      isRead: true,
    };
    threadStore = threadStore.map((t) =>
      t.id === threadId ? { ...t, messages: [...t.messages, newMsg], lastMessage: body } : t
    );
    return newMsg;
  },
};
