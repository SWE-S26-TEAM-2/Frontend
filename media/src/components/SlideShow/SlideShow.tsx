'use client';

import React, { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from 'next/image';
import LoginModal from "@/components/LoginModal/LoginModal";

//  Types 
interface IHoverButtonProps {
  children: React.ReactNode;
  style: React.CSSProperties;
  onClick?: () => void;
}

interface ISlideData {
  id: number;
  image: string;
  titles: string[];
  description: string;
  artistName: string;
  artistRoute: string;
  buttonText: string;
}

//  Mock Data 
const SLIDE_DATA: ISlideData[] = [
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

// Reusable HoverButton 
const HoverButton = ({ children, style, onClick }: IHoverButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const finalStyle: React.CSSProperties = {
    ...style,
    color: isHovered ? 'grey' : style.color || 'black',
    transition: 'color 0.2s ease',
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={finalStyle}
    >
      {children}
    </div>
  );
};

function SlideShow() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredArtistId, setHoveredArtistId] = useState<number | null>(null);

  return (
    <>
      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}

      <div style={{ width: '1200px', margin: '0 auto' }}>
        <Carousel indicators={true} controls={false} interval={5000}>
          {SLIDE_DATA.map((slide) => (
            <Carousel.Item key={slide.id}>
              <Image 
                src={slide.image} 
                alt={slide.artistName} 
                width={1200} 
                height={400} 
                style={slideStyle} 
                priority={slide.id === 1} 
              />
              
              <Carousel.Caption style={captionContainerStyle}>
                <div style={mainContentWrapper}>
                  <div>
                    {slide.titles.map((text, idx) => (
                      <h2 key={idx} style={headerStyle}>{text}</h2>
                    ))}
                  </div>
                  <p style={descriptionStyle}>{slide.description}</p>
                  
                  <HoverButton 
                    onClick={() => setIsModalOpen(true)} 
                    style={getStartedButtonStyle}
                  >
                    {slide.buttonText}
                  </HoverButton>
                </div>

                <div style={artistInfoWrapper}>
                  <h5 
                    onMouseEnter={() => setHoveredArtistId(slide.id)} 
                    onMouseLeave={() => setHoveredArtistId(null)}
                    onClick={() => router.push(slide.artistRoute)}
                    style={{ 
                      ...artistNameStyle, 
                      textDecoration: hoveredArtistId === slide.id ? 'underline' : 'none' 
                    }}
                  >
                    {slide.artistName}
                  </h5>
                  <h4 style={artistTitleStyle}>SoundCloud Artist Pro</h4>
                </div>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </>
  );
}

// Styles
const slideStyle: React.CSSProperties = {
  width: '100%',
  height: '450px',
  borderRadius: '12px',
  objectFit: 'cover',
  objectPosition: 'top',
  display: 'block',
};

const mainContentWrapper: React.CSSProperties = {
  paddingTop: '130px',
  textAlign: 'left',
  marginBottom: '20px',
  marginLeft: '-410px',
};

const headerStyle: React.CSSProperties = {
  fontSize: '60px',
  fontWeight: 'bold',
  margin: 0,
};

const descriptionStyle: React.CSSProperties = {
  fontSize: '20px',
  maxWidth: '700px',
  lineHeight: '1.4',
  fontWeight: '500',
  textAlign: 'left',
  paddingTop: '20px',
};

const artistInfoWrapper: React.CSSProperties = {
  position: 'absolute',
  bottom: '30px',
  right: '-99px',
  display: 'flex',
  alignItems: 'left',
  textAlign: 'left',
  gap: '10px',
  zIndex: 20,
  flexDirection: 'column',
};

const artistNameStyle: React.CSSProperties = {
  cursor: 'pointer',
  margin: 0,
  fontSize: '16px',
  fontWeight: 'bold',
  color: 'white',
  textAlign: 'left',
};

const artistTitleStyle: React.CSSProperties = {
  fontWeight: 'normal',
  fontSize: '10px',
  textAlign: 'left',
};

const getStartedButtonStyle: React.CSSProperties = {
  backgroundColor: 'white',
  width: '140px',
  textAlign: 'center',
  fontSize: '18px',
  color: 'black',
  paddingTop: '5px',
  paddingBottom: '5px',
  borderRadius: '6px',
  cursor: 'pointer',
  marginTop: '30px',
};

const captionContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  paddingBottom: '40px',
};

export default SlideShow;