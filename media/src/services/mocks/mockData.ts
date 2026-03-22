import { ITrack } from "@/types/track.types";

//settings/privacy
import { IPrivacySettings } from "@/types/privacy.types"; 

export const MOCK_TRACKS: ITrack[] = [
  {
    id: "1",
    title: "Vodafone",
    artist: "vod",
    albumArt: "/covers/song1.jpg",
    duration: 180,
    url: "/tracks/song1.mp3",
    genre: "Pop",
    likes: 234,
    plays: 12045,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-03-16T08:45:00Z",
  },
  {
    id: "2",
    title: "kol howa allah ahad",
    artist: "kuraan",
    albumArt: "/covers/song2.jpg",
    duration: 31,
    url: "/tracks/song2.mp3",
    genre: "Religious",
    likes: 567,
    plays: 38901,
    createdAt: "2024-02-01T14:20:00Z",
    updatedAt: "2024-03-16T09:15:00Z",
  },
  {
    id: "3",
    title: "Eg Bank",
    artist: "ARIAF",
    albumArt: "/covers/song4.jpg",
    duration: 190,
    url: "/tracks/song3.mp3",
    genre: "Pop",
    likes: 789,
    plays: 45678,
    createdAt: "2024-02-10T15:30:00Z",
    updatedAt: "2024-03-16T11:45:00Z",
   
  },
  {
    id: "4",
     title: "Orange",
    artist: "Amr Diab",
    albumArt: "/covers/song3.jpg",
    duration: 210,
    url: "/tracks/song4.mp3",
    genre: "Pop",
    likes: 890,
    plays: 56789,
    createdAt: "2024-01-20T11:45:00Z",
    updatedAt: "2024-03-16T10:30:00Z",

  }

];

// settings/privacy
export const MOCK_PRIVACY_SETTINGS: IPrivacySettings = {
  receiveMessages: true,
  showActivities: true,
  showTopFan: true,
  showTrackFans: true,
  blockedUsers: [],
};
