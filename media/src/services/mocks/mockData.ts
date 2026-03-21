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
    artist: "vod",
    albumArt: "/covers/song1.jpg",
    duration: 180,
    url: "/tracks/song1.mp3",
    genre: "Pop",
    likes: 234,
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
    createdAt: "2024-02-01T14:20:00Z",
    updatedAt: "2024-03-16T09:15:00Z",
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
