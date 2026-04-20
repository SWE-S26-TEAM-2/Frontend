// src/types/userProfile.types.ts
// ─────────────────────────────────────────────────────────────

import type { ITrack } from "@/types/track.types";

export interface IUser {
  id: string;
  username: string;
  location: string;
  bio?: string;                         
  favoriteGenres?: string[];          
  role: "artist" | "listener";         
  socialLinks?: {                       
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  isPrivate?: boolean;                  
  followers: number;
  following: number;
  tracks: number;
  likes: number;
  avatarUrl: string | null;
  headerUrl: string | null;
  isOwner: boolean;
}

export interface IUserProfileTrack {
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
}

export interface ILikedTrack {
  id: number;
  title: string;
  artist: string;
  plays?: number;
  likes?: number;
  reposts?: number;
  comments?: number;
  coverUrl: string | null;
  accentColor?: string;
}

export interface IFanUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  followers: number;
  tracks: number;
}

export interface IFollower {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface IFollowing {
  id: string;
  username: string;
  avatarUrl: string | null;
  followers: number;
  tracks: number;
  isVerified?: boolean;
}

export interface ISearchUser {
  id: string;
  username: string;
  role: "artist" | "listener";
  avatarUrl: string | null;
  followerCount: number;
  isVerified: boolean;
}

export interface IUserProfileService {
  getUserProfile(username: string): Promise<IUser>;
  getUserTracks(userId: string): Promise<ITrack[]>;
  getUserLikes(userId: string): Promise<ILikedTrack[]>;
  getFansAlsoLike(userId: string): Promise<IFanUser[]>;
  getFollowers(userId: string): Promise<IFollower[]>;
  getFollowing(userId: string): Promise<IFollowing[]>;
  followUser(userId: string): Promise<void>;
  unfollowUser(userId: string): Promise<void>;
  searchUsers(query: string): Promise<ISearchUser[]>;
}