"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import SlideShow from "../../../components/SlideShow/SlideShow";
import HoverButton from "@/components/HoverButton/HoverButton";
import LoginModal from "@/components/LoginModal/LoginModal";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";

// 1. MOCK CONTENT DATA
const LANDING_DATA = {
  trendingTagline: "Hear what's trending for free in the SoundCloud community",
  creatorSection: {
    title: "Calling all creators",
    text: "Get on SoundCloud to connect with fans, share your sounds, and grow your audience. What are you waiting for?",
    button: "Find out more"
  },
  footerLinks: ["Directory", "About us", "Jobs", "Press", "Blog", "Legal", "Privacy", "Cookies", "Charts"]
};
const MOCK_TRACKS = [
  { id: 1, title: "7AM ON BRIDLE PATH", artist: "Drake" },
  { id: 2, title: "MONTERO", artist: "Lil Nas X" },
  { id: 3, title: "SICKO MODE", artist: "Travis Scott" }
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
const [searchQuery, setSearchQuery] = useState("");
  //  THE GATEKEEPER 
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      router.push("/discover"); 
    }
  }, [router]);

  return (
    <>
      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}

      <div style={{ backgroundColor: "#141212", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
        <main style={{ padding: "3rem" }}>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>

            {/* TOP HEADER AREA */}
            <div style={{ position: "absolute", top: "20px", left: "50px", right: "65px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Image src="/logo1.png" alt="Logo" width={40} height={40} />
                <h1 style={{ color: "white", fontSize: "24px", margin: 0, fontWeight: "bold" }}>Sound Cloud</h1>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <HoverButton style={SIGN_IN_STYLE} onClick={() => setIsModalOpen(true)}>
                  Sign in
                </HoverButton>
                <HoverButton style={CREATE_ACC_STYLE} onClick={() => setIsModalOpen(true)}>
                  Create account
                </HoverButton>
                <HoverButton style={{ backgroundColor: "transparent", color: "white", border: "none", cursor: "pointer" }}>
                  For Artists
                </HoverButton>
              </div>
            </div>

            <SlideShow />

            {/* SEARCH */}
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "15px" }}>
              <div style={{ position: "relative" }}>
                <input
  type="text"
  placeholder="Search for artists, bands, tracks..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)} 
  style={SEARCH_INPUT_STYLE}
/>
{searchQuery && (
  <div style={RESULTS_DROPDOWN_STYLE}>
    {MOCK_TRACKS
      .filter(track => track.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(track => (
        <div key={track.id} style={{ padding: '10px', color: 'white' }}>
          {track.title} - {track.artist}
        </div>
      ))}
  </div>
)}
                <Image src="/searchicon.svg" alt="search" width={20} height={20} style={SEARCH_ICON_STYLE} />
              </div>
              <span style={{ color: "white", fontSize: "18px" }}>or</span>
              <HoverButton onClick={() => router.push('/Upload')} style={UPLOAD_BTN_STYLE}>
                Upload your own
              </HoverButton>
            </div>

            {/* TRENDING SECTION */}
            <div style={SECTION_CONTAINER}>
              <div style={{ fontSize: "25px", marginBottom: "20px" }}>
                {LANDING_DATA.trendingTagline}
              </div>
              <HoverButton onClick={() => router.push('/discover')} style={WHITE_BTN_STYLE}>
                Explore trending playlists
              </HoverButton>
            </div>

            {/* MIDDLE IMAGES */}
            <Image 
                src="/ad.png" 
                alt="Ad" 
                width={1200} 
                height={200} 
                style={{ width: "100%", height: "auto", display: "block" }} 
            />

            <div style={{ position: "relative", width: "1200px", height: "auto" }}>
              <Image 
                src="/beffooter.png" 
                alt="beffooter" 
                width={1200} 
                height={400} 
                style={{ width: "100%", display: "block" }} 
              />
              <div style={CREATOR_OVERLAY}>
                <h2 style={{ fontSize: "36px", marginBottom: "15px" }}>{LANDING_DATA.creatorSection.title}</h2>
                <p style={{ fontSize: "18px", lineHeight: "1.6", marginBottom: "30px", fontWeight: "bold" }}>
                  {LANDING_DATA.creatorSection.text}
                </p>
                <HoverButton style={WHITE_BTN_STYLE}>
                  {LANDING_DATA.creatorSection.button}
                </HoverButton>
              </div>
            </div>

            {/* JOIN SECTION */}
            <div style={SECTION_CONTAINER}>
              <h1 style={{ fontSize: "45px" }}>Thanks for listening. Now join in.</h1>
              <h2 style={{ fontWeight: "bold", fontSize: "18px", marginTop: "20px" }}>
                Save tracks, follow artists and build playlists. All for free.
              </h2>
              <HoverButton
                style={{ ...WHITE_BTN_STYLE, marginTop: "30px", padding: "12px 40px", fontSize: "20px" }}
                onClick={() => setIsModalOpen(true)}
              >
                Create account
              </HoverButton>
              <div style={{ display: "flex", gap: "10px", marginTop: "15px", alignItems: "center" }}>
                <h3 style={{ fontSize: "14px" }}>Already have an account?</h3>
                <HoverButton
                  style={{ backgroundColor: "transparent", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "bold", marginTop: "-5px" }}
                  onClick={() => setIsModalOpen(true)}
                >
                  Sign in
                </HoverButton>
              </div>
            </div>

          </div>

          {/* FOOTER */}
          <footer style={{ paddingTop: "50px", paddingBottom: "40px", color: "#999", fontSize: "13px", lineHeight: "2" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "flex-start", alignItems: "center" }}>
              {LANDING_DATA.footerLinks.map((link) => (
                <React.Fragment key={link}>
                  <span style={LINK_STYLE}>{link}</span> &middot;
                </React.Fragment>
              ))}
              <span style={{ marginLeft: "15px", color: "#ccc" }}>Language: <strong>English (US)</strong></span>
            </div>
          </footer>

        </main>
      </div>
    </>
  );
}

//STYLES 
const SIGN_IN_STYLE: React.CSSProperties = { padding: "8px 20px", backgroundColor: "#ffffff", color: "black", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", width: "100px" };
const CREATE_ACC_STYLE: React.CSSProperties = { padding: "8px 20px", backgroundColor: "black", color: "white", border: "1px solid #333", borderRadius: "4px", cursor: "pointer" };
const SEARCH_INPUT_STYLE: React.CSSProperties = { fontSize: "16px", width: "650px", height: "45px", borderRadius: "8px", border: "none", backgroundColor: "#333", color: "#fff", padding: "0 45px 0 15px", outline: "none" };
const SEARCH_ICON_STYLE: React.CSSProperties = { position: "absolute", right: "15px", top: "12px", opacity: 0.6 };
const UPLOAD_BTN_STYLE: React.CSSProperties = { height: "45px", padding: "0 25px", backgroundColor: "white", color: "black", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer" };
const SECTION_CONTAINER: React.CSSProperties = { color: "white", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "40px", textAlign: "center" };
const WHITE_BTN_STYLE: React.CSSProperties = { color: "black", backgroundColor: "white", fontSize: "18px", padding: "12px 24px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const CREATOR_OVERLAY: React.CSSProperties = { position: "absolute", top: "70px", left: "50px", width: "600px", textAlign: "left", color: "white" };
const LINK_STYLE: React.CSSProperties = { cursor: "pointer", color: "#999", transition: "color 0.2s" };
const RESULTS_DROPDOWN_STYLE: React.CSSProperties = {
  position: "absolute",
  top: "50px", // Sits right under the search input
  width: "650px",
  backgroundColor: "#222",
  borderRadius: "8px",
  boxShadow: "0px 4px 12px rgba(0,0,0,0.5)",
  zIndex: 1000,
  padding: "10px",
  border: "1px solid #444",
};