// src/services/api/userProfile.api.ts
import { ENV } from "@/config/env";
import type { IUserProfileService, IUser, IUserProfileTrack, ILikedTrack, IFanUser, IFollower, IFollowing } from "@/types/userProfile.types";
import type { ITrack } from "@/types/track.types";
import type { IEditProfilePayload } from "@/types/userProfile.types";

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

export const realUserProfileService: IUserProfileService = {
  async getUserProfile(username: string): Promise<IUser> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${username}`);
    if (!res.ok) throw new Error(`User "${username}" not found`);
    return res.json();
  },
  async getUserTracks(userId: string): Promise<ITrack[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${userId}/tracks`);
    if (!res.ok) throw new Error(`Could not fetch tracks for user "${userId}"`);
    const tracks = (await res.json()) as IUserProfileTrack[];
    return tracks.map(toCanonicalTrack);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateProfile(_userId: string, _payload: IEditProfilePayload): Promise<IUser> {
  throw new Error("updateProfile not implemented on real API yet");
},
};