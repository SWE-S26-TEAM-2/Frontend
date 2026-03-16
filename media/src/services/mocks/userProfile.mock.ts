// src/services/mocks/userProfile.mock.ts
// ─────────────────────────────────────────────────────────────
// Mock service — fake data that mimics real backend responses.
// Used when ENV.USE_MOCK_API = true in config/env.ts
// ─────────────────────────────────────────────────────────────

import { seededWaveform } from "@/utils/seededWaveform";
import type { IUserProfileService, User, Track, LikedTrack } from "@/services/userProfile.service";

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────
// FAKE DATABASE
// ─────────────────────────────────────────────────────────────
const MOCK_USERS: User[] = [
  {
    id: "test00user",
    username: "test00user",
    location: "Giza, Egypt",
    followers: 0,
    following: 3,
    tracks: 0,
    likes: 4,
    avatarUrl: null,
    headerUrl: null,
    isOwner: true,
  },
];

const MOCK_TRACKS: Track[] = [
  {
    id: 1,
    title: "Une vie à t'aimer",
    artist: "Lorien Testard, Alice Duport-Percier, Victor Borba",
    repostedBy: "test00user",
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
    repostedBy: "test00user",
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

const MOCK_LIKES: LikedTrack[] = [
  {
    id: 1,
    title: "Une vie à t'aimer",
    artist: "Lorien Testard, Alice Dup...",
    plays: 312000,
    likes: 5140,
    reposts: 70,
    comments: 99,
    coverUrl: null,
    accentColor: "#c0392b",
  },
  {
    id: 2,
    title: "Dark Souls 3 OST + DLC",
    artist: "mitchteck",
    likes: 3140,
    reposts: 76,
    coverUrl: null,
    accentColor: "#8B4513",
  },
  {
    id: 3,
    title: "Dark Souls III",
    artist: "RPG_OST",
    coverUrl: null,
    accentColor: "#2c3e50",
  },
  {
    id: 4,
    title: "For Those Who Come A...",
    artist: "Lorien Testard, Alice Dup",
    coverUrl: null,
    accentColor: "#1a252f",
  },
];

// ─────────────────────────────────────────────────────────────
// MOCK SERVICE — implements IUserProfileService
// ─────────────────────────────────────────────────────────────
export const mockUserProfileService: IUserProfileService = {

  async getUserProfile(username: string): Promise<User> {
    await delay(300);
    const user = MOCK_USERS.find(u => u.username === username);
    if (!user) throw new Error(`User "${username}" not found`);
    return user;
  },

  async getUserTracks(userId: string): Promise<Track[]> {
    await delay(300);
    return MOCK_TRACKS;
  },

  async getUserLikes(userId: string): Promise<LikedTrack[]> {
    await delay(300);
    return MOCK_LIKES;
  },

};