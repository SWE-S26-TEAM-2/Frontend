import { ISlideData, ILandingTrack, ILandingData } from "@/types/landing.types";

export const LANDING_DATA: ILandingData = {
  trendingTagline: "Hear what's trending for free in the SoundCloud community",
  creatorSection: {
    title: "Calling all creators",
    text: "Get on SoundCloud to connect with fans, share your sounds, and grow your audience. What are you waiting for?",
    button: "Find out more"
  },
  footerLinks: ["Directory", "About us", "Jobs", "Press", "Blog", "Legal", "Privacy", "Cookies", "Charts"]
};

export const MOCK_TRACKS: ILandingTrack[] = [
  { id: 1, title: "7AM ON BRIDLE PATH", artist: "Drake" },
  { id: 2, title: "MONTERO", artist: "Lil Nas X" },
  { id: 3, title: "SICKO MODE", artist: "Travis Scott" }
];

export const SLIDE_DATA: ISlideData[] = [
  {
    id: 1,
    image: "/dc1.png",
    titles: ["Discover.", "Get Discovered."],
    description: "Discover your next obsession, or become someone else’s. SoundCloud is the only community where fans and artists come together.",
    artistName: "DC the Don",
    artistRoute: "/dc-the-don",
    buttonText: "Get Started"
  },
  {
    id: 2,
    image: "/1900Rugrat_Press_ttofwt.jpg",
    titles: ["Connect.", "Share your Sound."],
    description: "Post your first track and begin your journey. SoundCloud gives you the tools to grow your audience and connect with creators around the world.",
    artistName: "1900Rugrat",
    artistRoute: "/1900rugrat",
    buttonText: "Upload Now"
  },
  {
    id: 3,
    image: "/cc.jpg",
    titles: ["Trending.", "Top of the Charts."],
    description: "From underground hits to global superstars. See what the SoundCloud community is listening to right now and find your new favorite artist.",
    artistName: "Central Cee",
    artistRoute: "/author/central-cee",
    buttonText: "Explore"
  }
];