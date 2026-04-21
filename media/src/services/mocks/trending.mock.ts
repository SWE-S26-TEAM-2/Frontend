// src/services/mocks/trending.mock.ts
import { IDotsMenuItem } from "../../types/trending.types";
import { ITrack } from "../../types/track.types";

// Helper to avoid repeating dates and stats in every mock
const mockMetadata = {
  url: "/test-audio.mp3",
  duration: 180,
  likes: 120,
  plays: 1500,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_CURATED: ITrack[] = [
  { id: "1", title: "Midnight City", artist: "M83", albumArt: "/test.png", ...mockMetadata },
  { id: "2", title: "Starboy", artist: "The Weeknd", albumArt: "/test.png", ...mockMetadata },
  { id: "3", title: "Nightcall", artist: "Kavinsky", albumArt: "/test.png", ...mockMetadata },
  { id: "4", title: "After Hours", artist: "The Weeknd", albumArt: "/test.png", ...mockMetadata },
  { id: "5", title: "Blinding Lights", artist: "The Weeknd", albumArt: "/test.png", ...mockMetadata },
  { id: "6", title: "Levitating", artist: "Dua Lipa", albumArt: "/test.png", ...mockMetadata },
];

export const MOCK_EMERGING: ITrack[] = [
  { id: "7", title: "New Wave", artist: "Future Artist", albumArt: "/test.png", ...mockMetadata },
  { id: "8", title: "Rising Sun", artist: "Solaris", albumArt: "/test.png", ...mockMetadata },
  { id: "9", title: "Neon Dreams", artist: "Synthwave Kid", albumArt: "/test.png", ...mockMetadata },
  { id: "10", title: "Digital Love", artist: "Daft Punk", albumArt: "/test.png", ...mockMetadata },
  { id: "11", title: "Harder Better", artist: "Daft Punk", albumArt: "/test.png", ...mockMetadata },
];

export const MOCK_POWER: ITrack[] = [
  { id: "12", title: "Power Workout", artist: "SoundCloud", albumArt: "/test.png", ...mockMetadata },
  { id: "13", title: "Focus Flow", artist: "Lo-Fi Beats", albumArt: "/test.png", ...mockMetadata },
  { id: "14", title: "Late Night Drive", artist: "Synth Pop", albumArt: "/test.png", ...mockMetadata },
  { id: "15", title: "Party Anthems", artist: "Various Artists", albumArt: "/test.png", ...mockMetadata },
];

// Simulated delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getCuratedTracks = async () => {
  await delay(300);
  return MOCK_CURATED;
};

export const getEmergingTracks = async () => {
  await delay(300);
  return MOCK_EMERGING;
};

export const getPowerPlaylists = async () => {
  await delay(300);
  return MOCK_POWER;
};