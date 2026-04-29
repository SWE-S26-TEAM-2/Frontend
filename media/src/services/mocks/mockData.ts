/*  eslint-disable @typescript-eslint/no-unused-vars */

import { ITrack } from '@/types/track.types';
import { IProduct } from '@/types/store.types';
import { IFeedItem } from '@/types/feed.types';
import { IPlaylist } from '@/types/playlist.types';
import { IComment } from '@/types/comment.types';
import { IMessageThread, IInboxItem } from '@/types/message.types';
import { IChart, IChartTrack } from '@/types/chart.types';
import { INotification } from '@/types/notification.types';
import { IAdminUser, IAdminTrack, IAdminStats, IAdminInsightPoint } from '@/types/admin.types';

// settings/privacy
import { IPrivacySettings } from '@/types/settings-privacy.types';

// settings/account
import { IAccountSettings } from '@/types/settings-account.types';
import { IBirthDate, IConnectedApp, IGender, ILinkedAccountInfo } from '@/types/settings-account.types';

// settings/notification
//import { INotificationSettings } from '@/types/settings-notification.types';
import { INotificationRow, INotificationSettings } from '@/types/settings-notification.types';

// settings/content
import { IContentSettings } from '@/types/settings-content.types';

// settings/advertising
import { IAdvertisingSettings } from '@/types/settings-advertising.types';

// settings/two-factor
import { ITwoFactorSettings } from '@/types/settings-two-factor.types';

export const MOCK_TRACKS: ITrack[] = [
  {
    id: '1',
    title: 'Vodafone',
    artist: 'Mohamed monir, Amir Eid, Asmaa galal',
    albumArt: '/covers/song1.jpg',
    duration: 180,
    url: '/tracks/song1.mp3',
    genre: 'Pop',
    likes: 234,
    plays: 12045,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-03-16T08:45:00Z',
  },
  {
    id: '2',
    title: 'kol howa allah ahad',
    artist: 'kuraan',
    albumArt: '/covers/song2.jpg',
    duration: 31,
    url: '/tracks/song2.mp3',
    genre: 'Religious',
    likes: 567,
    plays: 38901,
    createdAt: '2024-02-01T14:20:00Z',
    updatedAt: '2024-03-16T09:15:00Z',
  },
  {
    id: '3',
    title: 'Eg Bank',
    artist: 'ARIAF',
    albumArt: '/covers/song4.jpg',
    duration: 190,
    url: '/tracks/song3.mp3',
    genre: 'Pop',
    likes: 789,
    plays: 45678,
    createdAt: '2024-02-10T15:30:00Z',
    updatedAt: '2024-03-16T11:45:00Z',
  },
  {
    id: '4',
    title: 'Orange',
    artist: 'Amr Diab',
    albumArt: '/covers/song3.jpg',
    duration: 210,
    url: '/tracks/song4.mp3',
    genre: 'Pop',
    likes: 890,
    plays: 56789,
    createdAt: '2024-01-20T11:45:00Z',
    updatedAt: '2024-03-16T10:30:00Z',
  },
];

// settings/privacy
export const MOCK_PRIVACY_SETTINGS: IPrivacySettings = {
  receiveMessages: true,
  showActivities: true,
  showTopFan: true,
  showTrackFans: true,
  blockedUsers: [
    {
      id: "blocked-1",
      username: "Tamer Hosny - تامر حسني",
      avatarUrl: "/avatars/soundwave.jpg",
    },
  ],
};

// settings/account
export const MOCK_ACCOUNT_SETTINGS = {
  theme: "dark" as const,
  emails: [{ address: "user@example.com", isPrimary: true }],
  primaryEmail: "user@example.com",
  linkedAccounts: {
    facebook: false,
    google: true,
    apple: false,
  },
  linkedAccountsInfo: [
    { platform: "google" as const, name: "Retaj Hussein" },
  ],
  birthDate: {
    month: "November",
    day: 1,
    year: 2005,
  },
  gender: "Female" as const,
  connectedApps: [
    { id: "soundcloud-com", name: "SoundCloud.com" },
    { id: "soundcloud-artists", name: "SoundCloud for Artists" },
    { id: "m-soundcloud", name: "m.soundcloud.com" },
  ],
};

// settings/notification
// export const MOCK_NOTIFICATION_SETTINGS = {
//   activities: [
//     { name: 'New follower', email: false, devices: false },
//     { name: 'Repost of your post', email: true, devices: false },
//     { name: 'New post by followed user', email: true, devices: false },
//     { name: 'Likes and plays on your post', email: false, devices: false },
//     { name: 'Comment on your post', email: false, devices: false },
//     { name: 'Recommended Content', email: true, devices: false },
//     { name: 'New message', email: true, devices: 'Everyone' },
//   ],
//   soundcloudUpdates: [
//     { name: 'SoundCloud Feature Updates & Education', email: true, devices: false },
//     { name: 'Surveys and feedback', email: true, devices: false },
//     { name: 'Promotional & Partnership Content', email: true, devices: false },
//     { name: 'SoundCloud newsletter', email: true, devices: 'none' },
//   ],
// };
export const MOCK_NOTIFICATION_SETTINGS: INotificationSettings = {
  activities: [
    { name: 'New follower',                email: false, devices: false },
    { name: 'Repost of your post',         email: true,  devices: false },
    { name: 'New post by followed user',   email: true,  devices: false },
    { name: 'Likes and plays on your post',email: false, devices: false },
    { name: 'Comment on your post',        email: false, devices: false },
    { name: 'Recommended Content',         email: true,  devices: false },
    { name: 'New message',                 email: true,  devices: 'Everyone' },
  ] satisfies INotificationRow[],
  soundcloudUpdates: [
    { name: 'SoundCloud Feature Updates & Education', email: true, devices: false },
    { name: 'Surveys and feedback',                   email: true, devices: false },
    { name: 'Promotional & Partnership Content',      email: true, devices: false },
    { name: 'SoundCloud newsletter',                  email: true, devices: 'none' },
  ] satisfies INotificationRow[],
};

// settings/content
export const MOCK_CONTENT_SETTINGS: IContentSettings = {
  rssUrl:
    'https://feeds.soundcloud.com/users/soundcloud:users:1676128205/sounds.rss',
  emailDisplay: "don't display",
  customFeedTitle: '',
  category: '',
  statsServiceUrl: '',
  customAuthorName: '',
  language: 'English',
  subscriberRedirect: '',
  explicitContent: false,
  includeInRSS: false,
  creativeCommons: false,
};

// settings/advertising
export const MOCK_ADVERTISING_SETTINGS: IAdvertisingSettings = {
  partnersListUrl: '#',
  language: 'English (US)',
};

// settings/two-factor
export const MOCK_TWO_FACTOR_SETTINGS: ITwoFactorSettings = {
  isEnabled: false,
};

// store/products
export const MOCK_PRODUCTS: IProduct[] = [
  {
    id: 'p1',
    name: 'Lo-Fi Tee',
    artist: 'SoundCloud',
    category: 'merch',
    price: 3500,
    image: '/store/lofi-tee-black.jpg',
    description: 'CloudWear: Deep Cuts collection. Premium graphic tee.',
    inStock: true,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: 'p2',
    name: 'Color Lo-Fi Tee',
    artist: 'SoundCloud',
    category: 'merch',
    price: 3500,
    image: '/store/lofi-tee-white.jpg',
    description: 'CloudWear: Deep Cuts collection. Light colorway.',
    inStock: true,
    rating: 4.6,
    reviewCount: 98,
  },
  {
    id: 'p3',
    name: 'Chop+Screw Tee',
    artist: 'SoundCloud',
    category: 'merch',
    price: 3500,
    image: '/store/chop-screw-tee.jpg',
    description: 'Inspired by Houston\'s iconic DJ culture.',
    inStock: true,
    rating: 4.7,
    reviewCount: 210,
  },
  {
    id: 'p4',
    name: 'Camo Chop+Screw Tee',
    artist: 'SoundCloud',
    category: 'merch',
    price: 3800,
    image: '/store/camo-chop-screw-tee.jpg',
    description: 'Limited camo colorway. Restocking soon.',
    inStock: false,
    rating: 4.5,
    reviewCount: 56,
  },
  {
    id: 'p5',
    name: 'Dark Ambient Crew',
    artist: 'SoundCloud',
    category: 'merch',
    price: 4000,
    image: '/store/dark-ambient-crew.jpg',
    description: 'Heavyweight crewneck sweatshirt.',
    inStock: true,
    rating: 4.9,
    reviewCount: 178,
  },
  {
    id: 'p6',
    name: 'Green Room Hoodie',
    artist: 'SoundCloud',
    category: 'merch',
    price: 4250,
    image: '/store/green-room-hoodie.jpg',
    description: 'Classic pullover hoodie. On sale.',
    inStock: true,
    rating: 4.4,
    reviewCount: 89,
  },
  {
    id: 'p7',
    name: 'DnB Hat',
    artist: 'SoundCloud',
    category: 'merch',
    price: 2500,
    image: '/store/dnb-hat.jpg',
    description: 'Drum & Bass structured cap.',
    inStock: true,
    rating: 4.6,
    reviewCount: 43,
  },
  {
    id: 'p8',
    name: 'Synthpop Snapback',
    artist: 'SoundCloud',
    category: 'merch',
    price: 3000,
    image: '/store/synthpop-snapback.jpg',
    description: 'CloudWear: Deep Cuts snapback.',
    inStock: true,
    rating: 4.3,
    reviewCount: 67,
  },
  {
    id: 'p9',
    name: 'SoundCloud Core Tee',
    artist: 'SoundCloud',
    category: 'merch',
    price: 2850,
    image: '/store/core-tee-white.jpg',
    description: 'Essential logo tee in white.',
    inStock: true,
    rating: 4.7,
    reviewCount: 312,
  },
  {
    id: 'p10',
    name: 'Studio Staple Tee',
    artist: 'SoundCloud',
    category: 'merch',
    price: 2850,
    image: '/store/studio-staple-tee.jpg',
    description: 'Everyday studio essential in black.',
    inStock: true,
    rating: 4.5,
    reviewCount: 145,
  },
  {
    id: 'p11',
    name: 'Backstage Staple Tee',
    artist: 'SoundCloud',
    category: 'merch',
    price: 2850,
    image: '/store/backstage-tee.jpg',
    description: 'Backstage crew vibes.',
    inStock: true,
    rating: 4.4,
    reviewCount: 77,
  },
  {
    id: 'p12',
    name: 'Day One Bucket Hat',
    artist: 'SoundCloud',
    category: 'merch',
    price: 2850,
    image: '/store/day-one-bucket-hat.jpg',
    description: 'Bone colorway bucket hat for the OGs.',
    inStock: true,
    rating: 4.8,
    reviewCount: 91,
  },
];

// ─── Shared mock users ────────────────────────────────────────────────────────
export const MOCK_USERS = {
  soundwave:   { id: 'u1', username: 'soundwave',   avatarUrl: '/avatars/soundwave.jpg' },
  beatmaker99: { id: 'u2', username: 'beatmaker99', avatarUrl: '/avatars/beatmaker99.jpg' },
  listenerjane:{ id: 'u3', username: 'listenerjane',avatarUrl: '/avatars/listenerjane.jpg' },
  djremix:     { id: 'u4', username: 'djremix',     avatarUrl: '/avatars/djremix.jpg' },
  newuser2026: { id: 'u5', username: 'newuser2026', avatarUrl: '/avatars/newuser2026.jpg' },
};

// ─── Feed ─────────────────────────────────────────────────────────────────────
export const MOCK_FEED_ITEMS: IFeedItem[] = [
  { id: 'f1',  type: 'track',  actor: MOCK_USERS.soundwave,    track: MOCK_TRACKS[0], createdAt: '2026-04-12T08:00:00Z' },
  { id: 'f2',  type: 'repost', actor: MOCK_USERS.djremix,      track: MOCK_TRACKS[2], createdAt: '2026-04-12T07:30:00Z' },
  { id: 'f3',  type: 'like',   actor: MOCK_USERS.beatmaker99,  track: MOCK_TRACKS[1], createdAt: '2026-04-12T07:00:00Z' },
  { id: 'f4',  type: 'follow', actor: MOCK_USERS.listenerjane, followedUser: MOCK_USERS.soundwave, createdAt: '2026-04-12T06:45:00Z' },
  { id: 'f5',  type: 'track',  actor: MOCK_USERS.beatmaker99,  track: MOCK_TRACKS[3], createdAt: '2026-04-11T20:00:00Z' },
  { id: 'f6',  type: 'repost', actor: MOCK_USERS.newuser2026,  track: MOCK_TRACKS[0], createdAt: '2026-04-11T18:30:00Z' },
  { id: 'f7',  type: 'like',   actor: MOCK_USERS.soundwave,    track: MOCK_TRACKS[3], createdAt: '2026-04-11T17:00:00Z' },
  { id: 'f8',  type: 'track',  actor: MOCK_USERS.djremix,      track: MOCK_TRACKS[2], createdAt: '2026-04-11T14:00:00Z' },
  { id: 'f9',  type: 'follow', actor: MOCK_USERS.beatmaker99,  followedUser: MOCK_USERS.djremix,   createdAt: '2026-04-11T12:00:00Z' },
  { id: 'f10', type: 'track',  actor: MOCK_USERS.listenerjane, track: MOCK_TRACKS[1], createdAt: '2026-04-11T10:00:00Z' },
  { id: 'f11', type: 'repost', actor: MOCK_USERS.djremix,      track: MOCK_TRACKS[1], createdAt: '2026-04-10T22:00:00Z' },
  { id: 'f12', type: 'like',   actor: MOCK_USERS.newuser2026,  track: MOCK_TRACKS[2], createdAt: '2026-04-10T20:00:00Z' },
  { id: 'f13', type: 'track',  actor: MOCK_USERS.soundwave,    track: MOCK_TRACKS[3], createdAt: '2026-04-10T18:00:00Z' },
  { id: 'f14', type: 'follow', actor: MOCK_USERS.listenerjane, followedUser: MOCK_USERS.beatmaker99, createdAt: '2026-04-10T15:00:00Z' },
  { id: 'f15', type: 'repost', actor: MOCK_USERS.soundwave,    track: MOCK_TRACKS[0], createdAt: '2026-04-10T12:00:00Z' },
];

// ─── Playlists ────────────────────────────────────────────────────────────────
export const MOCK_PLAYLISTS: IPlaylist[] = [
  {
    id: 'pl1',
    slug: 'summer-vibes-2026',
    title: 'Summer Vibes 2026',
    type: 'playlist',
    owner: MOCK_USERS.soundwave,
    artworkUrl: '/covers/song1.jpg',
    description: 'The best tracks for summer 2026.',
    isPrivate: false,
    trackCount: 4,
    totalDuration: 611,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-04-10T08:00:00Z',
    tracks: MOCK_TRACKS.map((t, i) => ({ position: i + 1, track: t })),
  },
  {
    id: 'pl2',
    slug: 'late-night-sessions',
    title: 'Late Night Sessions',
    type: 'playlist',
    owner: MOCK_USERS.beatmaker99,
    artworkUrl: '/covers/song4.jpg',
    description: 'Deep cuts for the night owls.',
    isPrivate: false,
    trackCount: 3,
    totalDuration: 421,
    createdAt: '2026-02-15T22:00:00Z',
    updatedAt: '2026-04-08T20:00:00Z',
    tracks: [
      { position: 1, track: MOCK_TRACKS[3] },
      { position: 2, track: MOCK_TRACKS[0] },
      { position: 3, track: MOCK_TRACKS[2] },
    ],
  },
  {
    id: 'pl3',
    slug: 'pop-essentials',
    title: 'Pop Essentials',
    type: 'album',
    owner: MOCK_USERS.djremix,
    artworkUrl: '/covers/song3.jpg',
    description: 'Essential pop tracks curated by djremix.',
    isPrivate: false,
    trackCount: 4,
    totalDuration: 611,
    createdAt: '2026-01-20T12:00:00Z',
    updatedAt: '2026-04-01T10:00:00Z',
    tracks: MOCK_TRACKS.map((t, i) => ({ position: i + 1, track: t })),
  },
  {
    id: 'pl4',
    slug: 'chill-mix',
    title: 'Chill Mix',
    type: 'playlist',
    owner: MOCK_USERS.listenerjane,
    artworkUrl: '/covers/song2.jpg',
    isPrivate: false,
    trackCount: 2,
    totalDuration: 211,
    createdAt: '2026-03-10T16:00:00Z',
    updatedAt: '2026-04-05T14:00:00Z',
    tracks: [
      { position: 1, track: MOCK_TRACKS[1] },
      { position: 2, track: MOCK_TRACKS[0] },
    ],
  },
  {
    id: 'pl5',
    slug: 'debut-album',
    title: 'Debut Album',
    type: 'album',
    owner: MOCK_USERS.soundwave,
    artworkUrl: '/covers/song1.jpg',
    description: 'The debut album from soundwave.',
    isPrivate: false,
    trackCount: 4,
    totalDuration: 611,
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-04-11T08:00:00Z',
    tracks: MOCK_TRACKS.map((t, i) => ({ position: i + 1, track: t })),
  },
];

// ─── Comments ─────────────────────────────────────────────────────────────────
const buildComments = (trackId: string): IComment[] => [
  {
    id: `c${trackId}-1`, trackId, user: MOCK_USERS.djremix,
    body: 'This track hits different at 2am 🔥', createdAt: '2026-04-12T01:00:00Z',
    likeCount: 12, replyCount: 2,
    replies: [
      { id: `r${trackId}-1a`, user: MOCK_USERS.soundwave,    body: 'Facts 💯',           createdAt: '2026-04-12T01:30:00Z' },
      { id: `r${trackId}-1b`, user: MOCK_USERS.listenerjane, body: 'Same every night lol', createdAt: '2026-04-12T02:00:00Z' },
    ],
  },
  {
    id: `c${trackId}-2`, trackId, user: MOCK_USERS.beatmaker99,
    body: 'The production on this is insane. Who did the mixing?', createdAt: '2026-04-11T15:00:00Z',
    likeCount: 8, replyCount: 1,
    replies: [
      { id: `r${trackId}-2a`, user: MOCK_USERS.soundwave, body: 'Mixed it myself 🎛️', createdAt: '2026-04-11T15:45:00Z' },
    ],
  },
  {
    id: `c${trackId}-3`, trackId, user: MOCK_USERS.listenerjane,
    body: 'Been on repeat all week. Absolute banger.', createdAt: '2026-04-10T20:00:00Z',
    likeCount: 24, replyCount: 0, replies: [],
  },
  {
    id: `c${trackId}-4`, trackId, user: MOCK_USERS.newuser2026,
    body: 'Just found this in the charts — glad the algorithm delivered.', createdAt: '2026-04-10T14:00:00Z',
    likeCount: 5, replyCount: 0, replies: [],
  },
  {
    id: `c${trackId}-5`, trackId, user: MOCK_USERS.djremix,
    body: 'Would love a remix of this. DM me 👀', createdAt: '2026-04-09T22:00:00Z',
    likeCount: 3, replyCount: 0, replies: [],
  },
  {
    id: `c${trackId}-6`, trackId, user: MOCK_USERS.beatmaker99,
    body: 'The drop at 1:15 is unreal.', createdAt: '2026-04-09T18:00:00Z',
    likeCount: 17, replyCount: 0, replies: [],
  },
];

export const MOCK_COMMENTS: Record<string, IComment[]> = {
  '1': buildComments('1'),
  '2': buildComments('2'),
  '3': buildComments('3'),
  '4': buildComments('4'),
};

// ─── Messages ─────────────────────────────────────────────────────────────────
const ME = MOCK_USERS.soundwave; // current logged-in user

export const MOCK_THREADS: IMessageThread[] = [
  {
    id: 'th1', participant: MOCK_USERS.djremix,
    lastMessage: 'Let me know what you think of the remix!',
    lastMessageAt: '2026-04-12T09:00:00Z', unreadCount: 2,
    messages: [
      { id: 'm1a', threadId: 'th1', sender: ME,                  body: 'Hey, loved your last track!',            createdAt: '2026-04-11T10:00:00Z', isRead: true },
      { id: 'm1b', threadId: 'th1', sender: MOCK_USERS.djremix,  body: 'Thanks! Working on a remix too 🎧',      createdAt: '2026-04-11T10:30:00Z', isRead: true },
      { id: 'm1c', threadId: 'th1', sender: MOCK_USERS.djremix,  body: 'Let me know what you think of the remix!', createdAt: '2026-04-12T09:00:00Z', isRead: false },
    ],
  },
  {
    id: 'th2', participant: MOCK_USERS.beatmaker99,
    lastMessage: 'We should collab on something.',
    lastMessageAt: '2026-04-11T20:00:00Z', unreadCount: 0,
    messages: [
      { id: 'm2a', threadId: 'th2', sender: MOCK_USERS.beatmaker99, body: 'Yo, your tracks are fire 🔥',    createdAt: '2026-04-10T18:00:00Z', isRead: true },
      { id: 'm2b', threadId: 'th2', sender: ME,                     body: 'Thanks man! Same to you.',       createdAt: '2026-04-10T19:00:00Z', isRead: true },
      { id: 'm2c', threadId: 'th2', sender: MOCK_USERS.beatmaker99, body: 'We should collab on something.', createdAt: '2026-04-11T20:00:00Z', isRead: true },
    ],
  },
  {
    id: 'th3', participant: MOCK_USERS.listenerjane,
    lastMessage: 'Can you share the stems for Vodafone?',
    lastMessageAt: '2026-04-10T14:00:00Z', unreadCount: 1,
    messages: [
      { id: 'm3a', threadId: 'th3', sender: MOCK_USERS.listenerjane, body: 'Love your music!',                      createdAt: '2026-04-09T12:00:00Z', isRead: true },
      { id: 'm3b', threadId: 'th3', sender: MOCK_USERS.listenerjane, body: 'Can you share the stems for Vodafone?', createdAt: '2026-04-10T14:00:00Z', isRead: false },
    ],
  },
  {
    id: 'th4', participant: MOCK_USERS.newuser2026,
    lastMessage: 'Just followed you, keep it up!',
    lastMessageAt: '2026-04-08T11:00:00Z', unreadCount: 0,
    messages: [
      { id: 'm4a', threadId: 'th4', sender: MOCK_USERS.newuser2026, body: 'Just followed you, keep it up!', createdAt: '2026-04-08T11:00:00Z', isRead: true },
      { id: 'm4b', threadId: 'th4', sender: ME,                     body: 'Thanks! More tracks coming soon 🙌', createdAt: '2026-04-08T12:00:00Z', isRead: true },
    ],
  },
  {
    id: 'th5', participant: MOCK_USERS.beatmaker99,
    lastMessage: 'Friday 9pm sounds good.',
    lastMessageAt: '2026-04-07T16:00:00Z', unreadCount: 0,
    messages: [
      { id: 'm5a', threadId: 'th5', sender: ME,                     body: 'Wanna do a live stream?',       createdAt: '2026-04-07T14:00:00Z', isRead: true },
      { id: 'm5b', threadId: 'th5', sender: MOCK_USERS.beatmaker99, body: 'Friday 9pm sounds good.',        createdAt: '2026-04-07T16:00:00Z', isRead: true },
    ],
  },
];

export const MOCK_INBOX: IInboxItem[] = MOCK_THREADS.map((t) => ({
  threadId: t.id,
  participant: t.participant,
  lastMessage: t.lastMessage,
  lastMessageAt: t.lastMessageAt,
  unreadCount: t.unreadCount,
}));

// ─── Chart ────────────────────────────────────────────────────────────────────
const chartDeltas: IChartTrack['rankChange'][] = ['up', 'down', 'new', 'same', 'up', 'down', 'same', 'up', 'new', 'same'];

export const MOCK_CHART: IChart = {
  genre: 'all-music',
  period: 'top50',
  updatedAt: '2026-04-12T00:00:00Z',
  entries: Array.from({ length: 20 }, (_, i) => {
    const track = MOCK_TRACKS[i % MOCK_TRACKS.length];
    const change = chartDeltas[i % chartDeltas.length];
    return {
      rank: i + 1,
      rankDelta: change === 'up' ? 2 : change === 'down' ? -1 : 0,
      rankChange: change,
      track: { ...track, id: `chart-${i + 1}`, title: `${track.title} ${i > 3 ? `(Remix ${i})` : ''}`.trim() },
    };
  }),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: INotification[] = [
  { id: 'n1',  type: 'like',    actor: MOCK_USERS.djremix,      track: { id: '1', title: 'Vodafone',       albumArt: '/covers/song1.jpg' }, message: 'djremix liked your track Vodafone',              isRead: false, createdAt: '2026-04-12T08:00:00Z' },
  { id: 'n2',  type: 'follow',  actor: MOCK_USERS.beatmaker99,  message: 'beatmaker99 started following you',                                                                                           isRead: false, createdAt: '2026-04-12T07:30:00Z' },
  { id: 'n3',  type: 'repost',  actor: MOCK_USERS.listenerjane, track: { id: '2', title: 'kol howa allah ahad', albumArt: '/covers/song2.jpg' }, message: 'listenerjane reposted your track',          isRead: false, createdAt: '2026-04-12T06:00:00Z' },
  { id: 'n4',  type: 'comment', actor: MOCK_USERS.newuser2026,  track: { id: '3', title: 'Eg Bank',         albumArt: '/covers/song4.jpg' }, message: 'newuser2026 commented on your track Eg Bank',   isRead: true,  createdAt: '2026-04-11T20:00:00Z' },
  { id: 'n5',  type: 'like',    actor: MOCK_USERS.soundwave,    track: { id: '4', title: 'Orange',           albumArt: '/covers/song3.jpg' }, message: 'soundwave liked your track Orange',             isRead: true,  createdAt: '2026-04-11T18:00:00Z' },
  { id: 'n6',  type: 'follow',  actor: MOCK_USERS.listenerjane, message: 'listenerjane started following you',                                                                                          isRead: true,  createdAt: '2026-04-11T15:00:00Z' },
  { id: 'n7',  type: 'repost',  actor: MOCK_USERS.djremix,      track: { id: '1', title: 'Vodafone',         albumArt: '/covers/song1.jpg' }, message: 'djremix reposted your track Vodafone',         isRead: true,  createdAt: '2026-04-10T22:00:00Z' },
  { id: 'n8',  type: 'comment', actor: MOCK_USERS.beatmaker99,  track: { id: '2', title: 'kol howa allah ahad', albumArt: '/covers/song2.jpg' }, message: 'beatmaker99 commented on your track',      isRead: true,  createdAt: '2026-04-10T20:00:00Z' },
  { id: 'n9',  type: 'like',    actor: MOCK_USERS.newuser2026,  track: { id: '3', title: 'Eg Bank',           albumArt: '/covers/song4.jpg' }, message: 'newuser2026 liked your track Eg Bank',        isRead: true,  createdAt: '2026-04-09T14:00:00Z' },
  { id: 'n10', type: 'mention', actor: MOCK_USERS.djremix,      track: { id: '4', title: 'Orange',            albumArt: '/covers/song3.jpg' }, message: 'djremix mentioned you in a comment on Orange', isRead: true, createdAt: '2026-04-08T10:00:00Z' },
];

// ─── Admin ────────────────────────────────────────────────────────────────────
export const MOCK_ADMIN_USERS: IAdminUser[] = [
  { id: 'u1', username: 'soundwave',    email: 'soundwave@example.com',    avatarUrl: '/avatars/soundwave.jpg',    role: 'artist',   trackCount: 12, followerCount: 3402, joinedAt: '2024-01-10T00:00:00Z', isSuspended: false },
  { id: 'u2', username: 'beatmaker99',  email: 'beatmaker99@example.com',  avatarUrl: '/avatars/beatmaker99.jpg',  role: 'artist',   trackCount: 8,  followerCount: 1892, joinedAt: '2024-02-14T00:00:00Z', isSuspended: false },
  { id: 'u3', username: 'listenerjane', email: 'listenerjane@example.com', avatarUrl: '/avatars/listenerjane.jpg', role: 'listener', trackCount: 0,  followerCount: 124,  joinedAt: '2024-03-05T00:00:00Z', isSuspended: false },
  { id: 'u4', username: 'djremix',      email: 'djremix@example.com',      avatarUrl: '/avatars/djremix.jpg',      role: 'artist',   trackCount: 21, followerCount: 7830, joinedAt: '2023-11-20T00:00:00Z', isSuspended: false },
  { id: 'u5', username: 'newuser2026',  email: 'newuser2026@example.com',  avatarUrl: '/avatars/newuser2026.jpg',  role: 'listener', trackCount: 0,  followerCount: 8,    joinedAt: '2026-04-01T00:00:00Z', isSuspended: false },
];

export const MOCK_ADMIN_TRACKS: IAdminTrack[] = MOCK_TRACKS.map((t) => ({
  id: t.id, title: t.title, artist: t.artist, albumArt: t.albumArt,
  plays: t.plays, likes: t.likes,
  uploadedAt: t.createdAt, isPrivate: false,
}));

export const MOCK_ADMIN_STATS: IAdminStats = {
  totalUsers: 5,
  totalTracks: 4,
  totalPlays: MOCK_TRACKS.reduce((sum, t) => sum + t.plays, 0),
  newUsersToday: 1,
  newTracksToday: 0,
  activeUsersThisWeek: 4,
};

export const MOCK_ADMIN_INSIGHTS: IAdminInsightPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date('2026-04-12');
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toISOString().split('T')[0],
    plays: 800 + Math.floor(Math.sin(i * 0.4) * 300 + Math.random() * 200),
    signups: Math.floor(Math.random() * 5),
  };
});
