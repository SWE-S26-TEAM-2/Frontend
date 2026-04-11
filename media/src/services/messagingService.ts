/**
 * src/services/messagingService.ts
 *
 * Mock implementation of IMessagingService with real-time simulation.
 * - Bot replies to every message after a short delay (with typing indicator)
 * - New conversations can be created
 * - All state is in-memory; no backend required
 */

import type {
  IConversation,
  IConversationParticipant,
  IMessage,
  IMessagingService,
  ISendMessagePayload,
  ISetTypingPayload,
  ITypingIndicator,
} from '@/types/messaging.types';

// ── Seed participants ─────────────────────────────────────────────────────────

export const AVAILABLE_USERS: IConversationParticipant[] = [
  {
    userId: 'user_2',
    username: 'beatsbylucy',
    displayName: 'Lucy Fernandez',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
  },
  {
    userId: 'user_3',
    username: 'synthwave_riku',
    displayName: 'Riku Nakamura',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
  },
  {
    userId: 'user_4',
    username: 'djkhalida',
    displayName: 'Khalida Osei',
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
  },
  {
    userId: 'user_5',
    username: 'wavdrifter',
    displayName: 'Ezra Thompson',
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
  },
  {
    userId: 'user_6',
    username: 'lofimarco',
    displayName: 'Marco Vitali',
    avatarUrl: 'https://i.pravatar.cc/150?img=15',
  },
  {
    userId: 'user_7',
    username: 'solarabeats',
    displayName: 'Solara Kim',
    avatarUrl: 'https://i.pravatar.cc/150?img=56',
  },
];

// ── Bot reply banks ───────────────────────────────────────────────────────────

const BOT_TEXT_REPLIES = [
  'Yo that track slaps 🔥',
  'Sending this to everyone I know',
  'Been on repeat all day honestly',
  'The mix on this is insane',
  'Love the vibe, very late night energy',
  'collab when? 👀',
  'This is exactly what I needed today',
  'wait the drop at 1:20 though???',
  'Adding this to my workout playlist rn',
  'fr fr the production on this is crazy',
  'Who produced this?? It hits different',
  '🎧🎧🎧',
  'ok I might have to remix this',
  'bro the bassline is everything',
  'lowkey one of the best things I heard this week',
];

const BOT_TRACK_REPLY_COMMENTS = [
  'Ooh nice! Check this one out too 👇',
  'Speaking of tracks, you heard this?',
  'That reminded me of this one 🎵',
  'Similar vibe, you might like it',
];

// ── Seed Data ─────────────────────────────────────────────────────────────────

const SEED_CONVERSATIONS: IConversation[] = [
  {
    id: 'conv_1',
    participants: [AVAILABLE_USERS[0]],
    lastMessage: {
      id: 'msg_1_5',
      conversationId: 'conv_1',
      senderId: 'user_2',
      senderName: 'Lucy Fernandez',
      senderAvatarUrl: AVAILABLE_USERS[0].avatarUrl,
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      isSeen: false,
      type: 'text',
      content: 'Yo this drop goes HARD 🔥',
    },
    unreadCount: 3,
    updatedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: 'conv_2',
    participants: [AVAILABLE_USERS[1]],
    lastMessage: {
      id: 'msg_2_2',
      conversationId: 'conv_2',
      senderId: 'current_user',
      senderName: 'You',
      senderAvatarUrl: 'https://i.pravatar.cc/150?img=5',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      isSeen: true,
      type: 'track',
      trackId: '1',
      trackTitle: 'Midnight Drive Vol.2',
      trackArtist: 'Riku Nakamura',
      trackCoverUrl: 'https://picsum.photos/seed/track101/200/200',
      trackDuration: 247,
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'conv_3',
    participants: [AVAILABLE_USERS[2]],
    lastMessage: {
      id: 'msg_3_2',
      conversationId: 'conv_3',
      senderId: 'user_4',
      senderName: 'Khalida Osei',
      senderAvatarUrl: AVAILABLE_USERS[2].avatarUrl,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      isSeen: true,
      type: 'text',
      content: 'Can we collab on something this weekend?',
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

const SEED_MESSAGES: Record<string, IMessage[]> = {
  conv_1: [
    {
      id: 'msg_1_1',
      conversationId: 'conv_1',
      senderId: 'user_2',
      senderName: 'Lucy Fernandez',
      senderAvatarUrl: AVAILABLE_USERS[0].avatarUrl,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isSeen: true,
      type: 'text',
      content: 'Hey! Did you hear my new track?',
    },
    {
      id: 'msg_1_2',
      conversationId: 'conv_1',
      senderId: 'current_user',
      senderName: 'You',
      senderAvatarUrl: 'https://i.pravatar.cc/150?img=5',
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      isSeen: true,
      type: 'text',
      content: 'Not yet, send it over!',
    },
    {
      id: 'msg_1_3',
      conversationId: 'conv_1',
      senderId: 'user_2',
      senderName: 'Lucy Fernandez',
      senderAvatarUrl: AVAILABLE_USERS[0].avatarUrl,
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      isSeen: true,
      type: 'track',
      trackId: '1',
      trackTitle: 'Acid Rain',
      trackArtist: 'Lucy Fernandez',
      trackCoverUrl: 'https://picsum.photos/seed/track202/200/200',
      trackDuration: 193,
    },
    {
      id: 'msg_1_4',
      conversationId: 'conv_1',
      senderId: 'current_user',
      senderName: 'You',
      senderAvatarUrl: 'https://i.pravatar.cc/150?img=5',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      isSeen: true,
      type: 'text',
      content: 'Omg the bassline at 1:20 is incredible',
    },
    {
      id: 'msg_1_5',
      conversationId: 'conv_1',
      senderId: 'user_2',
      senderName: 'Lucy Fernandez',
      senderAvatarUrl: AVAILABLE_USERS[0].avatarUrl,
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      isSeen: false,
      type: 'text',
      content: 'Yo this drop goes HARD 🔥',
    },
  ],
  conv_2: [
    {
      id: 'msg_2_1',
      conversationId: 'conv_2',
      senderId: 'user_3',
      senderName: 'Riku Nakamura',
      senderAvatarUrl: AVAILABLE_USERS[1].avatarUrl,
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      isSeen: true,
      type: 'text',
      content: 'Check out my latest — just dropped',
    },
    {
      id: 'msg_2_2',
      conversationId: 'conv_2',
      senderId: 'current_user',
      senderName: 'You',
      senderAvatarUrl: 'https://i.pravatar.cc/150?img=5',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      isSeen: true,
      type: 'track',
      trackId: '1',
      trackTitle: 'Midnight Drive Vol.2',
      trackArtist: 'Riku Nakamura',
      trackCoverUrl: 'https://picsum.photos/seed/track101/200/200',
      trackDuration: 247,
    },
  ],
  conv_3: [
    {
      id: 'msg_3_1',
      conversationId: 'conv_3',
      senderId: 'current_user',
      senderName: 'You',
      senderAvatarUrl: 'https://i.pravatar.cc/150?img=5',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      isSeen: true,
      type: 'text',
      content: 'Hey Khalida! Big fan of your sets.',
    },
    {
      id: 'msg_3_2',
      conversationId: 'conv_3',
      senderId: 'user_4',
      senderName: 'Khalida Osei',
      senderAvatarUrl: AVAILABLE_USERS[2].avatarUrl,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      isSeen: true,
      type: 'text',
      content: 'Can we collab on something this weekend?',
    },
  ],
};

// ── In-memory mutable state ───────────────────────────────────────────────────

const _conversations: IConversation[] = SEED_CONVERSATIONS.map((c) => ({ ...c }));
const _messages: Map<string, IMessage[]> = new Map(
  Object.entries(SEED_MESSAGES).map(([k, v]) => [k, [...v]])
);
const _typing: Map<string, ITypingIndicator> = new Map();

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function simulateLatencyAsync(ms = 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Bot reply simulation ──────────────────────────────────────────────────────

function scheduleBotReply(conversationId: string, wasTrackMessage: boolean): void {
  const conv = _conversations.find((c) => c.id === conversationId);
  if (!conv) return;
  const bot = conv.participants[0];
  if (!bot) return;

  const typingDelay = 1500 + Math.random() * 1500;
  const replyDelay = typingDelay + 1000 + Math.random() * 1500;

  setTimeout(() => {
    _typing.set(conversationId, {
      conversationId,
      userId: bot.userId,
      username: bot.displayName,
      isTyping: true,
      updatedAt: new Date().toISOString(),
    });
  }, typingDelay);

  setTimeout(() => {
    _typing.delete(conversationId);

    const content = wasTrackMessage
      ? BOT_TRACK_REPLY_COMMENTS[Math.floor(Math.random() * BOT_TRACK_REPLY_COMMENTS.length)]
      : BOT_TEXT_REPLIES[Math.floor(Math.random() * BOT_TEXT_REPLIES.length)];

    const botMsg: IMessage = {
      id: generateId('msg'),
      conversationId,
      senderId: bot.userId,
      senderName: bot.displayName,
      senderAvatarUrl: bot.avatarUrl,
      timestamp: new Date().toISOString(),
      isSeen: false,
      type: 'text',
      content,
    };

    const existing = _messages.get(conversationId) ?? [];
    _messages.set(conversationId, [...existing, botMsg]);

    const convIdx = _conversations.findIndex((c) => c.id === conversationId);
    if (convIdx !== -1) {
      _conversations[convIdx] = {
        ..._conversations[convIdx],
        lastMessage: botMsg,
        updatedAt: botMsg.timestamp,
        unreadCount: _conversations[convIdx].unreadCount + 1,
      };
    }
  }, replyDelay);
}

// ── Service Implementation ────────────────────────────────────────────────────

export const messagingService: IMessagingService = {
  async getConversationsAsync(): Promise<IConversation[]> {
    await simulateLatencyAsync(150);
    return [..._conversations].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async getMessagesAsync(conversationId: string): Promise<IMessage[]> {
    await simulateLatencyAsync(150);
    return [...(_messages.get(conversationId) ?? [])];
  },

  async sendMessageAsync(payload: ISendMessagePayload): Promise<IMessage> {
    await simulateLatencyAsync(250);

    const base = {
      id: generateId('msg'),
      conversationId: payload.conversationId,
      senderId: 'current_user',
      senderName: 'You',
      senderAvatarUrl: 'https://i.pravatar.cc/150?img=5',
      timestamp: new Date().toISOString(),
      isSeen: false,
    };

    let newMessage: IMessage;
    if (payload.type === 'text') {
      newMessage = { ...base, type: 'text', content: payload.content };
    } else {
      newMessage = {
        ...base,
        type: 'track',
        trackId: payload.trackId,
        trackTitle: payload.trackTitle,
        trackArtist: payload.trackArtist,
        trackCoverUrl: payload.trackCoverUrl,
        trackDuration: payload.trackDuration,
      };
    }

    const existing = _messages.get(payload.conversationId) ?? [];
    _messages.set(payload.conversationId, [...existing, newMessage]);

    const convIdx = _conversations.findIndex((c) => c.id === payload.conversationId);
    if (convIdx !== -1) {
      _conversations[convIdx] = {
        ..._conversations[convIdx],
        lastMessage: newMessage,
        updatedAt: newMessage.timestamp,
        unreadCount: 0,
      };
    }

    scheduleBotReply(payload.conversationId, payload.type === 'track');
    return newMessage;
  },

  async markSeenAsync(conversationId: string, _messageId: string): Promise<void> {
    await simulateLatencyAsync(80);
    const msgs = _messages.get(conversationId);
    if (msgs) {
      _messages.set(conversationId, msgs.map((m) => ({ ...m, isSeen: true })));
    }
    const convIdx = _conversations.findIndex((c) => c.id === conversationId);
    if (convIdx !== -1) {
      _conversations[convIdx] = { ..._conversations[convIdx], unreadCount: 0 };
    }
  },

  async getTypingIndicatorAsync(conversationId: string): Promise<ITypingIndicator | null> {
    await simulateLatencyAsync(40);
    const indicator = _typing.get(conversationId);
    if (!indicator) return null;
    const age = Date.now() - new Date(indicator.updatedAt).getTime();
    if (age > 5000) {
      _typing.delete(conversationId);
      return null;
    }
    return indicator;
  },

  async setTypingAsync(payload: ISetTypingPayload): Promise<void> {
    await simulateLatencyAsync(40);
    if (!payload.isTyping) {
      _typing.delete(payload.conversationId);
    }
  },

  async createConversationAsync(participant: IConversationParticipant): Promise<IConversation> {
    await simulateLatencyAsync(200);
    // Return existing conversation if one already exists with this user
    const existing = _conversations.find((c) =>
      c.participants.some((p) => p.userId === participant.userId)
    );
    if (existing) return existing;

    const newConv: IConversation = {
      id: generateId('conv'),
      participants: [participant],
      lastMessage: null,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    _conversations.push(newConv);
    _messages.set(newConv.id, []);
    return newConv;
  },
};
