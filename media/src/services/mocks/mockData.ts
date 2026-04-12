/*  eslint-disable @typescript-eslint/no-unused-vars */

import { ITrack } from '@/types/track.types';
import { IProduct } from '@/types/store.types';

// settings/privacy
import { IPrivacySettings } from '@/types/settings-privacy.types';

// settings/account
import { IAccountSettings } from '@/types/settings-account.types';

// settings/notification
import { INotificationSettings } from '@/types/settings-notification.types';

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
  blockedUsers: [],
};

// settings/account
export const MOCK_ACCOUNT_SETTINGS: IAccountSettings = {
  theme: 'dark',
  emails: [{ address: 'user@example.com', isPrimary: true }],
  linkedAccounts: {
    facebook: false,
    google: false,
    apple: false,
  },
};

// settings/notification
export const MOCK_NOTIFICATION_SETTINGS: INotificationSettings = {
  activities: [
    { name: 'New follower', email: false, devices: 'Everyone' },
    { name: 'Repost of your post', email: true, devices: 'Everyone' },
    { name: 'New post by followed user', email: true, devices: 'Everyone' },
    { name: 'Likes and plays on your post', email: false, devices: 'Everyone' },
    { name: 'Comment on your post', email: false, devices: 'Everyone' },
    { name: 'Recommended Content', email: true, devices: 'Everyone' },
    { name: 'New message', email: true, devices: 'Everyone' },
  ],
  soundcloudUpdates: [
    {
      name: 'SoundCloud Feature Updates & Education',
      email: true,
      devices: 'Everyone',
    },
    { name: 'Surveys and feedback', email: true, devices: 'Everyone' },
    {
      name: 'Promotional & Partnership Content',
      email: true,
      devices: 'Everyone',
    },
    { name: 'SoundCloud newsletter', email: true, devices: 'No one' },
  ],
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
