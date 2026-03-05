export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  url: string;
  genre?: string;
  likes?: number;
}

export const MOCK_TRACKS: Track[] = [
  {
    id: "1",
    title: "Vodafone",
    artist: "vod",
    albumArt: "/covers/song1.jpg",
    duration: 180, // in seconds — check your song length
    url: "/tracks/song1.mp3",
    genre: "Your Genre",
    likes: 0,
  },
  {
    id: "2",
    title: "kol howa allah ahad",
    artist: "kuraan",
    albumArt: "/covers/song2.jpg",
    duration: 31,
    url: "/tracks/song2.mp3",
    genre: "Your Genre",
    likes: 0,
  }
  // add more...
];

// export const MOCK_TRACKS: Track[] = [
//   {
//     id: "1",
//     title: "I Mean What I Said",
//     artist: "Sunny Black",
//     albumArt: "https://i.pravatar.cc/48?img=1",
//     duration: 158,
//     url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
//     genre: "Hip-Hop",
//     likes: 240,
//   },
//   {
//     id: "2",
//     title: "God in the Fight",
//     artist: "Major Syndicate PA Radio",
//     albumArt: "https://i.pravatar.cc/48?img=2",
//     duration: 155,
//     url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
//     genre: "Gospel",
//     likes: 183,
//   },
//   {
//     id: "3",
//     title: "Falling Slowly",
//     artist: "Novix",
//     albumArt: "https://i.pravatar.cc/48?img=3",
//     duration: 212,
//     url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
//     genre: "Pop",
//     likes: 512,
//   },
//   {
//     id: "4",
//     title: "Level Up",
//     artist: "The Peak EDM",
//     albumArt: "https://i.pravatar.cc/48?img=4",
//     duration: 190,
//     url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
//     genre: "EDM",
//     likes: 890,
//   },
// ];
