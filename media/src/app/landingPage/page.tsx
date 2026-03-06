"use client";

import React, { useState } from 'react';
import SlideShow from '../../components/slideShow';
import 'bootstrap/dist/css/bootstrap.min.css';

// 1. Create a reusable HoverButton to handle the font color change
const HoverButton = ({ children, style, onClick }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  const finalStyle = {
    ...style,
    color: isHovered ? "grey" : (style.color || "black"), // Changes to grey on hover
    transition: "color 0.2s ease", // Smooth transition
  };

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={finalStyle}
    >
      {children}
    </button>
  );
};

export default function Home() {
  return (
    <div style={{ backgroundColor: "#141212", minHeight: "100vh", display: 'flex', justifyContent: 'center' }}>
      <main style={{ padding: '3rem' }}>
        
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          {/* TOP HEADER AREA */}
          <div style={{ position: "absolute", top: "20px", left: "50px", right: "65px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src="/logo1.png" alt="Logo" style={{ width: "40px", height: "auto" }} />
              <h1 style={{ color: "white", fontSize: "24px", margin: 0, fontWeight: "bold" }}>Sound Cloud</h1>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <HoverButton style={{ padding: "8px 20px", backgroundColor: "#ffffff", color: "black", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", width: "100px" }}>Sign in</HoverButton>
              <HoverButton style={{ padding: "8px 20px", backgroundColor: "black", color: "white", border: "1px solid #333", borderRadius: "4px", cursor: "pointer" }}>Create account</HoverButton>
              <HoverButton style={{ backgroundColor: "transparent", color: "white", border: "none", cursor: "pointer" }}>For Artists</HoverButton>
            </div>
          </div>

          <SlideShow />

          {/* SEARCH */}
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "15px" }}>
            <div style={{ position: "relative" }}>
              <input type="text" placeholder="Search for artists, bands, tracks, podcasts" style={{ fontSize: "16px", width: "650px", height: "45px", borderRadius: "8px", border: "none", backgroundColor: "#333", color: "#fff", padding: "0 45px 0 15px", outline: "none" }} />
              <img src="/searchicon.svg" alt="search" style={{ position: "absolute", right: "15px", top: "12px", width: "20px", opacity: 0.6 }} />
            </div>
            <span style={{ color: "white", fontSize: "18px" }}>or</span>
            <HoverButton style={{ height: "45px", padding: "0 25px", backgroundColor: "white", color: "black", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer" }}>Upload your own</HoverButton>
          </div>
          
          {/* TRENDING SECTION */}
          <div style={{ color: "white", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "25px", marginBottom: "20px" }}>Hear what’s trending for free in the SoundCloud community</div>
            <HoverButton style={{ color: "black", backgroundColor: "white", fontSize: "18px", padding: "12px 24px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Explore trending playlists</HoverButton>
          </div>

          <img src="/ad.png" style={{ width: "1200px", marginTop: "40px" }} alt="Ad" />

          <div style={{ position: "relative", width: "1200px", height: "auto" }}>
            <img src="/beffooter.png" style={{ width: "100%", display: "block" }} alt="beffooter" />
            <div style={{ position: "absolute", top: "70px", left: "50px", width: "600px", textAlign: "left", color: "white" }}>
              <h2 style={{ fontSize: "36px", marginBottom: "15px" }}>Calling all creators</h2>
              <p style={{ fontSize: "18px", lineHeight: "1.6", marginBottom: "30px", fontWeight: "bold" }}>Get on SoundCloud to connect with fans, share your sounds, and grow your audience. What are you waiting for?</p>
              <HoverButton style={{ padding: "12px 24px", fontSize: "16px", backgroundColor: "white", color: "black", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>Find out more</HoverButton>
            </div>
          </div>

          <div style={{ color: "white", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "70px", textAlign: "center" }}>
            <h1 style={{ fontSize: "45px" }}>Thanks for listening. Now join in.</h1>
            <h2 style={{ fontWeight: "bold", fontSize: "18px", marginTop: "20px" }}>Save tracks, follow artists and build playlists. All for free.</h2>
            <HoverButton style={{ marginTop: "30px", padding: "12px 40px", fontSize: "20px", backgroundColor: "white", color: "black", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Create account</HoverButton>
            <div style={{ display: "flex", gap: "10px", marginTop: "15px", alignItems: "center" }}>
              <h3 style={{ fontSize: "14px" }}>Already have an account? </h3>
              <HoverButton style={{ backgroundColor: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "bold", marginTop: "-5px" }}>Sign in</HoverButton>
            </div>
          </div>

        </div>

        <footer style={{ paddingTop: "50px", paddingBottom: "40px", color: "#999", fontSize: "13px", lineHeight: "2" }}>
            {/* Footer links remain the same */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "flex-start", alignItems: "center" }}>
              <span style={linkStyle}>Directory</span> · 
              <span style={linkStyle}>About us</span> · 
              {/* ... other spans ... */}
              <span style={{ marginLeft: "15px", color: "#ccc" }}>Language: <strong>English (US)</strong></span>
            </div>
        </footer>
      </main>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  cursor: "pointer",
  color: "#999",
  transition: "color 0.2s"
};