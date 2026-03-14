// src/services/mocks/userProfile.mock.ts
// ─────────────────────────────────────────────────────────────
// Temporary mock data for the User Profile page.
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// TYPES  
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

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

export function timeAgo(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60)   return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export const seededWaveform = (seed: number): number[] =>
  Array.from({ length: 80 }, (_, i) => {
    const x = Math.sin((i + seed) * 127.1) * 43758.5453;
    return Math.abs(x - Math.floor(x));
  });

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────

export const mockUser: User = {
  id: "test00user",
  username: "test00user",
  location: "Giza, Egypt",
  followers: 0,
  following: 3,
  tracks: 0,
  likes: 4,
  avatarUrl: null,    
  headerUrl: null,    
  isOwner: true,      // set based on auth: currentUser.id === profileUser.id
};

export const mockTracks: Track[] = [
  {
    id: 1,
    title: "Une vie à t'aimer",
    artist: "Lorien Testard, Alice Duport-Percier, Victor Borba",
    repostedBy: "test00user",
    createdAt: new Date(Date.now() - 36 * 60 * 1000).toISOString(), // 36 min ago
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
    createdAt: new Date(Date.now() - 37 * 60 * 1000).toISOString(), // 37 min ago
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

export const mockLikes: LikedTrack[] = [
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