// src/services/mocks/userProfile.mock.ts
// ─────────────────────────────────────────────────────────────
// Mock service — simulates the real API during development.
// Used when ENV.USE_MOCK_API = true in config/env.ts
// ─────────────────────────────────────────────────────────────

import { seededWaveform } from "@/utils/seededWaveform";
import type { ITrack } from "@/types/track.types";
import type {
  IUserProfileService, IUser, IUserProfileTrack, ILikedTrack,
  IFanUser, IFollower, IFollowing,
} from "@/types/userProfile.types";

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

function toCanonicalTrack(track: IUserProfileTrack): ITrack {
  const durationInSeconds = track.duration.includes(":")
    ? track.duration
        .split(":")
        .map((v) => parseInt(v, 10) || 0)
        .reduce((acc, part) => acc * 60 + part, 0)
    : parseInt(track.duration, 10) || 0;

  return {
    id: track.id.toString(),
    title: track.title,
    artist: track.artist,
    albumArt: track.coverUrl || "",
    genre: track.genre || undefined,
    url: "",
    duration: durationInSeconds,
    likes: track.likes,
    plays: track.plays,
    commentsCount: track.comments,
    isLiked: track.isLiked,
    createdAt: track.createdAt,
    updatedAt: track.createdAt,
  };
}

// ─────────────────────────────────────────────────────────────
// FAKE DATABASE
// ─────────────────────────────────────────────────────────────

const MOCK_USERS: IUser[] = [
  // Own profile (logged in user)
  {
    id: "testuser",
    username: "testuser",
    location: "Giza, Egypt",
    bio: "Music lover from Giza, Egypt.",
    favoriteGenres: ["Soundtrack", "OST", "Classical"],
    role: "listener",
    socialLinks: {},
    isPrivate: false,
    followers: 0,
    following: 3,
    tracks: 0,
    likes: 4,
    avatarUrl: null,
    headerUrl: null,
    isOwner: true,
  },
  // Public profile (another user — artist)
  {
    id: "testartist",
    username: "testartist",
    location: "Nashville, TN",
    bio: "NEW ALBUM SOON",
    favoriteGenres: ["Pop", "Country", "Indie"],
    role: "artist",
    socialLinks: {
      website: "https://taylorswift.com",
      instagram: "https://instagram.com/taylorswift",
      twitter: "https://twitter.com/taylorswift13",
      facebook: "https://facebook.com/taylorswift",
    },
    isPrivate: false,
    followers: 1040000,
    following: 2,
    tracks: 722,
    likes: 150,
    avatarUrl: null,
    headerUrl: null,
    isOwner: false,
  },
];

const MOCK_TRACKS: IUserProfileTrack[] = [
  {
    id: 1,
    title: "Une vie à t'aimer",
    artist: "Lorien Testard, Alice Duport-Percier, Victor Borba",
    repostedBy: "testuser",
    createdAt: new Date(Date.now() - 36 * 60 * 1000).toISOString(),
    genre: "Soundtrack",
    likes: 5140,
    reposts: 70,
    plays: 312000,
    comments: 99,
    duration: "11:00",
    coverUrl: null,
    waveform: seededWaveform(1),
    playedPercent: 0.28,
    isLiked: true,
  },
  {
    id: 2,
    title: "Christopher Larkin",
    artist: "Jeremy",
    repostedBy: "testuser",
    createdAt: new Date(Date.now() - 37 * 60 * 1000).toISOString(),
    genre: null,
    likes: 3140,
    reposts: 76,
    plays: 198000,
    comments: 45,
    duration: "6:57",
    coverUrl: null,
    waveform: seededWaveform(2),
    playedPercent: 0,
    isLiked: false,
  },
];

const MOCK_LIKES: ILikedTrack[] = [
  { id: 1, title: "Une vie à t'aimer", artist: "Lorien Testard, Alice Dup...", plays: 312000, likes: 5140, reposts: 70, comments: 99, coverUrl: null, accentColor: "#c0392b" },
  { id: 2, title: "Dark Souls 3 OST + DLC", artist: "mitchteck", likes: 3140, reposts: 76, coverUrl: null, accentColor: "#8B4513" },
  { id: 3, title: "Dark Souls III", artist: "RPG_OST", coverUrl: null, accentColor: "#2c3e50" },
  { id: 4, title: "For Those Who Come A...", artist: "Lorien Testard, Alice Dup", coverUrl: null, accentColor: "#1a252f" },
];

const MOCK_FANS: IFanUser[] = [
  { id: "jenny", username: "Jenny Talia", avatarUrl: null, followers: 1141, tracks: 8 },
  { id: "lethal", username: "LE7HAL", avatarUrl: null, followers: 121, tracks: 9 },
  { id: "no", username: "N.O", avatarUrl: null, followers: 223, tracks: 6 },
];

const MOCK_FOLLOWERS: IFollower[] = [
  { id: "f1", username: "user1", avatarUrl: null },
  { id: "f2", username: "user2", avatarUrl: null },
  { id: "f3", username: "user3", avatarUrl: null },
  { id: "f4", username: "user4", avatarUrl: null },
  { id: "f5", username: "user5", avatarUrl: null },
  { id: "f6", username: "user6", avatarUrl: null },
  { id: "f7", username: "user7", avatarUrl: null },
  { id: "f8", username: "user8", avatarUrl: null },
];

const MOCK_FOLLOWING: IFollowing[] = [
  { id: "miley", username: "Miley Cyrus", avatarUrl: null, followers: 1440000, tracks: 304, isVerified: true },
  { id: "maroon5", username: "Maroon 5", avatarUrl: null, followers: 1760000, tracks: 328, isVerified: true },
];

// ─────────────────────────────────────────────────────────────
// MOCK SERVICE
// ─────────────────────────────────────────────────────────────
export const mockUserProfileService: IUserProfileService = {

  async getUserProfile(userId: string): Promise<IUser> {
    await delay(300);
    const user = MOCK_USERS.find(u => u.id === userId || u.username === userId);
    if (!user) throw new Error(`User "${userId}" not found`);
    return user;
  },

  async getUserTracks(userId: string): Promise<ITrack[]> {
    await delay(300);
    // Owner has no tracks yet — shows empty state
    if (userId === "testuser") return [];
    return MOCK_TRACKS.map(toCanonicalTrack);
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserLikes(_userId: string): Promise<ILikedTrack[]> {
    await delay(300);
    return MOCK_LIKES;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getFansAlsoLike(_userId: string): Promise<IFanUser[]> {
    await delay(300);
    return MOCK_FANS;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getFollowers(_userId: string): Promise<IFollower[]> {
    await delay(300);
    return MOCK_FOLLOWERS;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getFollowing(_userId: string): Promise<IFollowing[]> {
    await delay(300);
    return MOCK_FOLLOWING;
  },

};