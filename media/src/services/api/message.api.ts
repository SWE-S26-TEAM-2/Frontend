import { ENV } from "@/config/env";
import type { IInboxItem, IMessage, IMessageThread, IMessageService } from "@/types/message.types";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});

export const realMessageService: IMessageService = {
  getInbox: async (): Promise<IInboxItem[]> => {
    const res = await fetch(`${ENV.API_BASE_URL}/messages`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to fetch inbox");
    return res.json();
  },

  getThread: async (threadId: string): Promise<IMessageThread> => {
    const res = await fetch(`${ENV.API_BASE_URL}/messages/${threadId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to fetch thread");
    return res.json();
  },

  sendMessage: async (threadId: string, body: string): Promise<IMessage> => {
    const res = await fetch(`${ENV.API_BASE_URL}/messages/${threadId}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ body }),
    });
    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
  },
};
