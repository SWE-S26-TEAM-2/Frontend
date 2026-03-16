// src/services/api/userProfile.api.ts
// ─────────────────────────────────────────────────────────────
// Real API service — used when ENV.USE_MOCK_API = false
// ─────────────────────────────────────────────────────────────

import { ENV } from "@/config/env";
import type { IUserProfileService, User, Track, LikedTrack } from "@/services/userProfile.service"; 

export const realUserProfileService: IUserProfileService = {

  async getUserProfile(username: string): Promise<User> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${username}`);
    if (!res.ok) throw new Error(`User "${username}" not found`);
    return res.json();
  },

  async getUserTracks(userId: string): Promise<Track[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/tracks`);
    if (!res.ok) throw new Error(`Could not fetch tracks for user "${userId}"`);
    return res.json();
  },

  async getUserLikes(userId: string): Promise<LikedTrack[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/likes`);
    if (!res.ok) throw new Error(`Could not fetch likes for user "${userId}"`);
    return res.json();
  },

};