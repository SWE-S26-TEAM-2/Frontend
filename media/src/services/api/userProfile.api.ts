// src/services/api/userProfile.api.ts
import { ENV } from "@/config/env";
import type { IUserProfileService, IUser, ITrack, ILikedTrack, IFanUser, IFollower, IFollowing } from "@/types/userProfile.types";

export const realUserProfileService: IUserProfileService = {
  async getUserProfile(username: string): Promise<IUser> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${username}`);
    if (!res.ok) throw new Error(`User "${username}" not found`);
    return res.json();
  },
  async getUserTracks(userId: string): Promise<ITrack[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/tracks`);
    if (!res.ok) throw new Error(`Could not fetch tracks for user "${userId}"`);
    return res.json();
  },
  async getUserLikes(userId: string): Promise<ILikedTrack[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/likes`);
    if (!res.ok) throw new Error(`Could not fetch likes for user "${userId}"`);
    return res.json();
  },
  async getFansAlsoLike(userId: string): Promise<IFanUser[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/fans`);
    if (!res.ok) throw new Error(`Could not fetch fans for user "${userId}"`);
    return res.json();
  },
  async getFollowers(userId: string): Promise<IFollower[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/followers`);
    if (!res.ok) throw new Error(`Could not fetch followers for user "${userId}"`);
    return res.json();
  },
  async getFollowing(userId: string): Promise<IFollowing[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/following`);
    if (!res.ok) throw new Error(`Could not fetch following for user "${userId}"`);
    return res.json();
  },
};