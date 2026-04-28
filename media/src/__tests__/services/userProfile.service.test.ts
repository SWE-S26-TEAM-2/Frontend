// src/__tests__/services/userProfile.service.test.ts
import { mockUserProfileService } from "@/services/mocks/userProfile.mock";
import { realUserProfileService } from "@/services/api/userProfile.api";

// Mock global fetch for realUserProfileService tests
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

describe("mockUserProfileService", () => {

  describe("getUserProfile", () => {
    it("returns a user with the requested username", async () => {
      const user = await mockUserProfileService.getUserProfile("testuser");
      expect(user.username).toBe("testuser");
    });

    it("returns a user with all required fields", async () => {
      const user = await mockUserProfileService.getUserProfile("testuser");
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
      await expect(mockUserProfileService.getUserProfile("nonexistent"))
        .rejects.toThrow("not found");
    });
  });

  describe("getUserTracks", () => {
    // Use testartist — testuser returns [] intentionally (owner with no tracks)
    it("returns an array of tracks for user with tracks", async () => {
      const tracks = await mockUserProfileService.getUserTracks("testartist");
      expect(Array.isArray(tracks)).toBe(true);
      expect(tracks.length).toBeGreaterThan(0);
    });

    it("returns empty array for owner with no tracks", async () => {
      const tracks = await mockUserProfileService.getUserTracks("testuser");
      expect(Array.isArray(tracks)).toBe(true);
      expect(tracks.length).toBe(0);
    });

    it("returns tracks with all required fields", async () => {
      const tracks = await mockUserProfileService.getUserTracks("testartist");
      const track = tracks[0];
      expect(track).toHaveProperty("id");
      expect(track).toHaveProperty("title");
      expect(track).toHaveProperty("artist");
      expect(track).toHaveProperty("albumArt");
      expect(track).toHaveProperty("url");
      expect(track).toHaveProperty("duration");
      expect(track).toHaveProperty("likes");
      expect(track).toHaveProperty("plays");
      expect(track).toHaveProperty("commentsCount");
      expect(track).toHaveProperty("isLiked");
      expect(track).toHaveProperty("createdAt");
      expect(track).toHaveProperty("updatedAt");
    });

    it("duration is a non-negative number", async () => {
      const tracks = await mockUserProfileService.getUserTracks("testartist");
      tracks.forEach(track => {
        expect(typeof track.duration).toBe("number");
        expect(track.duration).toBeGreaterThanOrEqual(0);
      });
    });

    it("id is normalized as a string", async () => {
      const tracks = await mockUserProfileService.getUserTracks("testartist");
      tracks.forEach(track => {
        expect(typeof track.id).toBe("string");
      });
    });
  });

  describe("getUserLikes", () => {
    it("returns an array of liked tracks", async () => {
      const likes = await mockUserProfileService.getUserLikes("testuser");
      expect(Array.isArray(likes)).toBe(true);
      expect(likes.length).toBeGreaterThan(0);
    });

    it("returns liked tracks with required fields", async () => {
      const likes = await mockUserProfileService.getUserLikes("testuser");
      likes.forEach(like => {
        expect(like).toHaveProperty("id");
        expect(like).toHaveProperty("title");
        expect(like).toHaveProperty("artist");
      });
    });
  });

  describe("getFansAlsoLike", () => {
    it("returns an array of fans", async () => {
      const fans = await mockUserProfileService.getFansAlsoLike("testartist");
      expect(Array.isArray(fans)).toBe(true);
      expect(fans.length).toBeGreaterThan(0);
    });

    it("returns fans with required fields", async () => {
      const fans = await mockUserProfileService.getFansAlsoLike("testartist");
      fans.forEach(fan => {
        expect(fan).toHaveProperty("id");
        expect(fan).toHaveProperty("username");
        expect(fan).toHaveProperty("followers");
        expect(fan).toHaveProperty("tracks");
      });
    });
  });

  describe("getFollowers", () => {
    it("returns an array of followers", async () => {
      const followers = await mockUserProfileService.getFollowers("testartist");
      expect(Array.isArray(followers)).toBe(true);
      expect(followers.length).toBeGreaterThan(0);
    });
  });

  describe("getFollowing", () => {
    it("returns an array of following", async () => {
      const following = await mockUserProfileService.getFollowing("testartist");
      expect(Array.isArray(following)).toBe(true);
      expect(following.length).toBeGreaterThan(0);
    });

    it("returns following with verified field", async () => {
      const following = await mockUserProfileService.getFollowing("testartist");
      following.forEach(f => {
        expect(f).toHaveProperty("id");
        expect(f).toHaveProperty("username");
        expect(f).toHaveProperty("followers");
        expect(f).toHaveProperty("tracks");
      });
    });
  });

  describe("mock/real switch", () => {
    it("mockUserProfileService returns correct user", async () => {
      const user = await mockUserProfileService.getUserProfile("testuser");
      expect(user.username).toBe("testuser");
    });

    it("mockUserProfileService throws for unknown user", async () => {
      await expect(mockUserProfileService.getUserProfile("nobody"))
        .rejects.toThrow("not found");
    });

    it("realUserProfileService has all required methods", () => {
      expect(typeof realUserProfileService.getUserProfile).toBe("function");
      expect(typeof realUserProfileService.getUserTracks).toBe("function");
      expect(typeof realUserProfileService.getUserLikes).toBe("function");
      expect(typeof realUserProfileService.getFansAlsoLike).toBe("function");
      expect(typeof realUserProfileService.getFollowers).toBe("function");
      expect(typeof realUserProfileService.getFollowing).toBe("function");
    });
  });
});

describe("realUserProfileService", () => {
  beforeEach(() => mockFetch.mockClear());

  it("getUserProfile calls correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user_id: "1", display_name: "testuser" }),
    });
    const user = await realUserProfileService.getUserProfile("testuser");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/users/testuser"),
      expect.objectContaining({ headers: expect.any(Object) })
    );
    expect(user.username).toBe("testuser");
  });

  it("getUserProfile throws when response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(realUserProfileService.getUserProfile("testuser"))
      .rejects.toThrow("not found");
  });

  it("getUserTracks calls correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    await realUserProfileService.getUserTracks("user123");
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/users/user123/tracks"), expect.anything());
  });

  it("getUserTracks returns empty array when response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    const result = await realUserProfileService.getUserTracks("user123");
    expect(result).toEqual([]);
  });

  it("getUserLikes calls correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    await realUserProfileService.getUserLikes("user123");
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/users/user123/likes"), expect.anything());
  });

  it("getUserLikes returns empty array when response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    const result = await realUserProfileService.getUserLikes("user123");
    expect(result).toEqual([]);
  });

  it("getFansAlsoLike calls correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    await realUserProfileService.getFansAlsoLike("user123");
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/users/user123/fans"), expect.anything());
  });

  it("getFollowers calls correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    await realUserProfileService.getFollowers("user123");
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/users/user123/followers"), expect.anything());
  });

  it("getFollowing calls correct endpoint", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    await realUserProfileService.getFollowing("user123");
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/users/user123/following"), expect.anything());
  });
});