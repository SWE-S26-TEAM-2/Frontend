// src/services/userProfile.service.ts
// ─────────────────────────────────────────────────────────────

import { ENV } from "@/config/env";
import { mockUserProfileService } from "@/services/mocks/userProfile.mock";
import { realUserProfileService } from "@/services/api/userProfile.api";

// ─────────────────────────────────────────────────────────────
// TYPES — defined here, imported by mock, api, and components
// ─────────────────────────────────────────────────────────────
export type User = {
  id: string;
  username: string;
  location: string;
  followers: number;
  following: number;
  tracks: number;
  likes: number;
  avatarUrl: string | null;
  headerUrl: string | null;
  isOwner: boolean;
};

export type Track = {
  id: number;
  title: string;
  artist: string;
  repostedBy: string | null;
  createdAt: string;
  genre: string | null;
  likes: number;
  reposts: number;
  plays: number;
  comments: number;
  duration: string;
  coverUrl: string | null;
  waveform: number[];
  playedPercent: number;
  isLiked: boolean;
};

export type LikedTrack = {
  id: number;
  title: string;
  artist: string;
  plays?: number;
  likes?: number;
  reposts?: number;
  comments?: number;
  coverUrl: string | null;
  accentColor?: string;
};

export interface IUserProfileService {
  getUserProfile(username: string): Promise<User>;
  getUserTracks(userId: string): Promise<Track[]>;
  getUserLikes(userId: string): Promise<LikedTrack[]>;
}

// ─────────────────────────────────────────────────────────────
export const userProfileService: IUserProfileService = ENV.USE_MOCK_API
  ? mockUserProfileService
  : realUserProfileService;