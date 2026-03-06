"use client";

import React, { useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

// 1. Reusable HoverButton for the Carousel Slides
const HoverButton = ({ children, style, onClick }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  const finalStyle = {
    ...style,
    color: isHovered ? "grey" : (style.color || "black"),
    transition: "color 0.2s ease",
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

function UncontrolledExample() {
  const router = useRouter();
  
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const [isHovered3, setIsHovered3] = useState(false);

  const slideStyle = {
    width: "1200px",
    height: "400px",
    borderRadius: "12px",
    objectFit: "cover" as const,
  };

  return (
    <div style={{ width: "1200px", margin: "0 auto" }}>
      <Carousel indicators={true} controls={false}>
        
        {/* Item 1: DC the Don */}
        <Carousel.Item>
          <img style={slideStyle} src="/320x320.jpg" alt="Slide 1" />
          <Carousel.Caption style={captionContainerStyle}>
            <div style={mainContentWrapper}>
              <div>
                <h2 style={headerStyle}>Discover.</h2>
                <h2 style={headerStyle}>Get Discovered.</h2>
              </div>
              <p style={descriptionStyle}>
                Discover your next obsession, or become someone else’s.
                SoundCloud is the only community where fans and artists come together to discover and connect through music.
              </p>
              <HoverButton 
                onClick={() => router.push("/Category/Technology")} 
                style={getStartedButtonStyle}
              >
                Get Started
              </HoverButton>
            </div>

            <div style={artistInfoWrapper}>
              <h5
                onMouseEnter={() => setIsHovered1(true)}
                onMouseLeave={() => setIsHovered1(false)}
                onClick={() => router.push("/author/dc-the-don")}
                style={{ ...artistNameStyle, textDecoration: isHovered1 ? "underline" : "none" }}
              >
                DC the Don
              </h5>
              <h4 style={artistTitleStyle}>SoundCloud Artist Pro</h4>
            </div>
          </Carousel.Caption>
        </Carousel.Item>

        {/* Item 2: Central Cee */}
        <Carousel.Item>
          <img style={slideStyle} src="/320x320.jpg" alt="Slide 2" />
          <Carousel.Caption style={captionContainerStyle}>
            <div style={mainContentWrapper}>
              <div>
                <h2 style={headerStyle}>Connect.</h2>
                <h2 style={headerStyle}>Share your Sound.</h2>
              </div>
              <p style={descriptionStyle}>
                Post your first track and begin your journey. SoundCloud gives you the 
                tools to grow your audience and connect with creators around the world.
              </p>
              <HoverButton 
                onClick={() => router.push("/Category/Music")} 
                style={getStartedButtonStyle}
              >
                Upload Now
              </HoverButton>
            </div>

            <div style={artistInfoWrapper}>
              <h5
                onMouseEnter={() => setIsHovered2(true)}
                onMouseLeave={() => setIsHovered2(false)}
                onClick={() => router.push("/author/central-cee")}
                style={{ ...artistNameStyle, textDecoration: isHovered2 ? "underline" : "none" }}
              >
                Central Cee
              </h5>
              <h4 style={artistTitleStyle}>SoundCloud Artist Pro</h4>
            </div>
          </Carousel.Caption>
        </Carousel.Item>

        {/* Item 3: Doja Cat */}
        <Carousel.Item>
          <img style={slideStyle} src="/320x320.jpg" alt="Slide 3" />
          <Carousel.Caption style={captionContainerStyle}>
            <div style={mainContentWrapper}>
              <div>
                <h2 style={headerStyle}>Trending.</h2>
                <h2 style={headerStyle}>Top of the Charts.</h2>
              </div>
              <p style={descriptionStyle}>
                From underground hits to global superstars. See what the SoundCloud 
                community is listening to right now and find your new favorite artist.
              </p>
              <HoverButton 
                onClick={() => router.push("/Category/Trending")} 
                style={getStartedButtonStyle}
              >
                Explore
              </HoverButton>
            </div>

            <div style={artistInfoWrapper}>
              <h5
                onMouseEnter={() => setIsHovered3(true)}
                onMouseLeave={() => setIsHovered3(false)}
                onClick={() => router.push("/author/doja-cat")}
                style={{ ...artistNameStyle, textDecoration: isHovered3 ? "underline" : "none" }}
              >
                Doja Cat
              </h5>
              <h4 style={artistTitleStyle}>SoundCloud Artist Pro</h4>
            </div>
          </Carousel.Caption>
        </Carousel.Item>

      </Carousel>
    </div>
  );
}

// --- Styles ---

const mainContentWrapper: React.CSSProperties = {
  paddingTop: "130px",
  textAlign: "left",
  marginBottom: "20px",
  marginLeft: "-410px",
};

const headerStyle: React.CSSProperties = { 
  fontSize: "60px", 
  fontWeight: "bold", 
  margin: 0 
};

const descriptionStyle: React.CSSProperties = { 
  fontSize: "20px", 
  maxWidth: "700px", 
  lineHeight: "1.4", 
  fontWeight: "500", 
  textAlign: "left", 
  paddingTop: "20px" 
};

const artistInfoWrapper: React.CSSProperties = {
  position: "absolute",
  bottom: "30px",
  right: "-99px",
  display: "flex",
  alignItems: "left",
  textAlign: "left",
  gap: "10px",
  zIndex: 20,
  flexDirection: "column",
};

const artistNameStyle: React.CSSProperties = {
  cursor: "pointer",
  margin: 0,
  fontSize: "16px",
  fontWeight: "bold",
  color: "white",
  textAlign: "left",
};

const artistTitleStyle: React.CSSProperties = { 
  fontWeight: "normal", 
  fontSize: "10px", 
  textAlign: "left" 
};

const getStartedButtonStyle: React.CSSProperties = {
  backgroundColor: "white",
  width: "140px",
  textAlign: "center",
  fontSize: "18px",
  color: "black",
  paddingTop: "5px",
  paddingBottom: "5px",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: "30px",
};

const captionContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  paddingBottom: "40px",
};

export default UncontrolledExample;