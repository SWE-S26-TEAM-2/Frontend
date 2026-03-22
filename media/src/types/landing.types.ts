export interface ISlideData {
  id: number;
  image: string;
  titles: string[];
  description: string;
  artistName: string;
  artistRoute: string;
  buttonText: string;
}

export interface ITrack {
  id: number;
  title: string;
  artist: string;
}

export interface ILandingData {
  trendingTagline: string;
  creatorSection: {
    title: string;
    text: string;
    button: string;
  };
  footerLinks: string[];
}

