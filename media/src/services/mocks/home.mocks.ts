import { ITrack } from '../../types/track.types';
import { IRecentItem, IArtist } from '../../types/home.types';

export const MOCK_MORE_LIKE: ITrack[] = [
  { 
    id: "1", 
    title: "Starboy", 
    artist: "The Weeknd", 
    albumArt: "/test.png",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 230,
    likes: 1200,
    plays: 50000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: "2", 
    title: "SICKO MODE", 
    artist: "Travis Scott", 
    albumArt: "/test.png", 
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 312,
    likes: 3400,
    plays: 90000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const MOCK_RECENTLY_PLAYED: IRecentItem[] = [
  { 
    id: "10", 
    title: "After Hours", 
    artist: "The Weeknd", 
    albumArt: "/test.png",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: 360,
    likes: 5000,
    type: 'track', 
    plays: 100000,
    playedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// --- ADDED THIS SECTION TO FIX THE ERROR ---
export const MOCK_MIXED: ITrack[] = [
  { 
    id: "20", 
    title: "Daily Mix 1", 
    artist: "Made for You", 
    albumArt: "/test.png", 
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: 180,
    likes: 500,
    plays: 20000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: "21", 
    title: "Daily Mix 2", 
    artist: "Made for You", 
    albumArt: "/test.png", 
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    duration: 210,
    likes: 300,
    plays: 15000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const MOCK_FOLLOW_SUGGESTIONS: IArtist[] = [
  { id: "101", name: "Metro Boomin", followers: "12.4M", tracksCount: 85, imageUrl: "/test.png", type: 'artist' },
  { id: "102", name: "Future", followers: "25.1M", tracksCount: 340, imageUrl: "/test.png", type: 'artist' },
];

export const MOCK_HISTORY: ITrack[] = [
  { 
    id: "501", 
    title: "Knife Talk", 
    artist: "Drake ft. 21 Savage", 
    albumArt: "/test.png", 
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: 242,
    likes: 450000, 
    plays: 1100000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];