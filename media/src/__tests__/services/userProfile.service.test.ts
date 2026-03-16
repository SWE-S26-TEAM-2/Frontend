// src/__tests__/services/userProfile.service.test.ts
import { userProfileService, type User, type Track, type LikedTrack } from "@/services/userProfile.service";

describe("userProfileService", () => {

  describe("getUserProfile", () => {
    it("returns a user with the requested username", async () => {
      const user = await userProfileService.getUserProfile("test00user");
      expect(user.username).toBe("test00user");
    });

    it("returns a user with all required fields", async () => {
      const user = await userProfileService.getUserProfile("test00user");
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("username");
      expect(user).toHaveProperty("location");
      expect(user).toHaveProperty("followers");
      expect(user).toHaveProperty("following");
      expect(user).toHaveProperty("tracks");
      expect(user).toHaveProperty("likes");
      expect(user).toHaveProperty("isOwner");
    });

    it("throws an error for unknown username", async () => {
      await expect(userProfileService.getUserProfile("nonexistent"))
        .rejects.toThrow("not found");
    });
  });

  describe("getUserTracks", () => {
    it("returns an array of tracks", async () => {
      const tracks = await userProfileService.getUserTracks("test00user");
      expect(Array.isArray(tracks)).toBe(true);
      expect(tracks.length).toBeGreaterThan(0);
    });

    it("returns tracks with all required fields", async () => {
      const tracks = await userProfileService.getUserTracks("test00user");
      const track = tracks[0];
      expect(track).toHaveProperty("id");
      expect(track).toHaveProperty("title");
      expect(track).toHaveProperty("artist");
      expect(track).toHaveProperty("duration");
      expect(track).toHaveProperty("waveform");
      expect(track).toHaveProperty("playedPercent");
      expect(track).toHaveProperty("isLiked");
      expect(track).toHaveProperty("createdAt");
    });

    it("waveform values are between 0 and 1", async () => {
      const tracks = await userProfileService.getUserTracks("test00user");
      tracks.forEach(track => {
        track.waveform.forEach(v => {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(1);
        });
      });
    });

    it("playedPercent is between 0 and 1", async () => {
      const tracks = await userProfileService.getUserTracks("test00user");
      tracks.forEach(track => {
        expect(track.playedPercent).toBeGreaterThanOrEqual(0);
        expect(track.playedPercent).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("getUserLikes", () => {
    it("returns an array of liked tracks", async () => {
      const likes = await userProfileService.getUserLikes("test00user");
      expect(Array.isArray(likes)).toBe(true);
      expect(likes.length).toBeGreaterThan(0);
    });

    it("returns liked tracks with required fields", async () => {
      const likes = await userProfileService.getUserLikes("test00user");
      likes.forEach(like => {
        expect(like).toHaveProperty("id");
        expect(like).toHaveProperty("title");
        expect(like).toHaveProperty("artist");
      });
    });
  });

});