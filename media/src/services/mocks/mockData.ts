/* eslint-disable @typescript-eslint/no-unused-vars */
import { ITrack } from "@/types/track.types";

// settings/privacy
import { IPrivacySettings } from "@/types/settings-privacy.types"; 

// settings/account
import { IAccountSettings } from "@/types/settings-account.types";

// settings/notification
import { INotificationSettings } from "@/types/settings-notification.types";

// settings/content
import { IContentSettings } from "@/types/settings-content.types";

// settings/advertising
import { IAdvertisingSettings } from "@/types/settings-advertising.types";

// settings/two-factor
import { ITwoFactorSettings } from "@/types/settings-two-factor.types";

export const MOCK_TRACKS: ITrack[] = [
  {
    id: "1",
    title: "Vodafone",
    artist: "Mohamed monir, Amir Eid, Asmaa galal",
    albumArt: "/covers/song1.jpg",
    duration: 180,
    url: "/tracks/song1.mp3",
    genre: "Pop",
    likes: 234,
    plays: 12045,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-03-16T08:45:00Z",
  },
  {
    id: "2",
    title: "kol howa allah ahad",
    artist: "kuraan",
    albumArt: "/covers/song2.jpg",
    duration: 31,
    url: "/tracks/song2.mp3",
    genre: "Religious",
    likes: 567,
    plays: 38901,
    createdAt: "2024-02-01T14:20:00Z",
    updatedAt: "2024-03-16T09:15:00Z",
  },
  {
    id: "3",
    title: "Eg Bank",
    artist: "ARIAF",
    albumArt: "/covers/song4.jpg",
    duration: 190,
    url: "/tracks/song3.mp3",
    genre: "Pop",
    likes: 789,
    plays: 45678,
    createdAt: "2024-02-10T15:30:00Z",
    updatedAt: "2024-03-16T11:45:00Z",
   
  },
  {
    id: "4",
     title: "Orange",
    artist: "Amr Diab",
    albumArt: "/covers/song3.jpg",
    duration: 210,
    url: "/tracks/song4.mp3",
    genre: "Pop",
    likes: 890,
    plays: 56789,
    createdAt: "2024-01-20T11:45:00Z",
    updatedAt: "2024-03-16T10:30:00Z",

  }

];

// settings/privacy
export const MOCK_PRIVACY_SETTINGS: IPrivacySettings = {
  receiveMessages: true,
  showActivities: true,
  showTopFan: true,
  showTrackFans: true,
  blockedUsers: [],
};
    { address: "user@example.com", isPrimary: true },
  ],
  linkedAccounts: {
    facebook: false,
    google: false,
    apple: false,
  },
};

// settings/notification
export const MOCK_NOTIFICATION_SETTINGS: INotificationSettings = {
  activities: [
    { name: "New follower", email: false, devices: true },
    { name: "Repost of your post", email: true, devices: true },
    { name: "New post by followed user", email: true, devices: true },
    { name: "Likes and plays on your post", email: false, devices: true },
    { name: "Comment on your post", email: false, devices: true },
    { name: "Recommended Content", email: true, devices: true },
    { name: "New message", email: true, devices: "Everyone" },
  ],
  soundcloudUpdates: [
    { name: "SoundCloud Feature Updates & Education", email: true, devices: true },
    { name: "Surveys and feedback", email: true, devices: true },
    { name: "Promotional & Partnership Content", email: true, devices: true },
    { name: "SoundCloud newsletter", email: true, devices: false },
  ],
};

// settings/content
export const MOCK_CONTENT_SETTINGS: IContentSettings = {
  rssUrl: "https://feeds.soundcloud.com/users/soundcloud:users:1676128205/sounds.rss",
  emailDisplay: "don't display",
  customFeedTitle: "",
  category: "",
  statsServiceUrl: "",
  customAuthorName: "",
  language: "English",
  subscriberRedirect: "",
  explicitContent: false,
  includeInRSS: false,
  creativeCommons: false,
};

// settings/advertising
export const MOCK_ADVERTISING_SETTINGS: IAdvertisingSettings = {
  partnersListUrl: "#",
  language: "English (US)",
};

// settings/two-factor
export const MOCK_TWO_FACTOR_SETTINGS: ITwoFactorSettings = {
  isEnabled: false,
};
