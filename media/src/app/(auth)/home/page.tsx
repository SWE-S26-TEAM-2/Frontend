"use client";

import React, { useEffect, useState } from 'react';
import TrackSlider from '../../../components/Track/TrackSlider';
import RecentlyPlayedGrid from '../../../components/Home/RecentlyPlayed';
import RightSidebar from '../../../components/Home/SideBar'; 
import { HomeAPI } from '../../../services/api/home.api';
import { IHomePageData } from '../../../types/home.types';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';

export default function HomePage() {
  const [data, setData] = useState<IHomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const username = "User"; 
  

  // Fetch all data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await HomeAPI.getHomePageData(username);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [username]);

  // Loading state to prevent errors while data is fetching
  if (isLoading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner}>Loading SoundCloud...</div>
      </div>
    );
  }

  // Safety return if data is missing
  if (!data) return null;

  
 return (
    <>
    <Header/>
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        <div style={styles.mainContent}>
          
          <TrackSlider 
            title="More of what you like" 
            subtitle="Suggestions based on your recent plays"
            tracks={data.moreOfWhatYouLike} 
          />

          <RecentlyPlayedGrid items={data.recentlyPlayed} />

          {/* Added showFollow={false} here */}
          <TrackSlider 
            title={`Mixed for ${username}`} 
            subtitle="Your personal daily music update"
            tracks={data.mixedForUser} 
            showFollow={false} 
          />

          {/* Added showFollow={false} here */}
          <TrackSlider 
            title="Discover with stations" 
            subtitle="Pick a track and we'll play similar music"
            tracks={data.discoverStations} 
            showFollow={false} 
          />
        </div>

        <div style={styles.rightSidebarWrapper}>
          <RightSidebar 
            followSuggestions={data.followSuggestions}
            listeningHistory={data.listeningHistory}
          />
        </div>

      </div>
      <Footer />
    </div>
    </>
  );
}
  

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    backgroundColor: '#121212', 
    minHeight: '100vh',
    width: '100%',
  },
  container: {
    padding: '40px 20px',
    maxWidth: '1240px', 
    margin: '0 auto',
    display: 'flex',    
    gap: '50px', 
    backgroundColor: 'transparent', 
  },
  mainContent: {
    flex: '7',          // Takes 70%
    minWidth: '0',      // Crucial for allowing sliders to shrink/scroll correctly
  },
  rightSidebarWrapper: {
    flex: '3',          // Takes 30%
    minWidth: '320px',  
  },
  loadingWrapper: {
    backgroundColor: '#121212',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ccc',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif'
  },
  spinner: {
    padding: '20px',
    border: '1px solid #333',
    borderRadius: '8px',
    backgroundColor: '#1a1a1a'
  }
};