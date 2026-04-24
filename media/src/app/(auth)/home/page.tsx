"use client";

import React, { useEffect, useState } from 'react';
import TrackSlider from '../../../components/Track/TrackSlider';
import RecentlyPlayedGrid from '../../../components/Home/RecentlyPlayed';
import RightSidebar from '../../../components/Home/SideBar'; 
import { homeService } from '@/services';
import { IHomePageData } from '../../../types/home.types';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';

export default function HomePage() {
  const [data, setData] = useState<IHomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const username = "User"; 

  useEffect(() => {
    const loadData = async () => {
      try {
const result = await homeService.getHomePageData(username);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [username]);

  if (isLoading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner}>Loading SoundCloud...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <Header/>
      
      {/* NATIVE CSS MEDIA QUERIES (Professional approach for inline-style setups) */}
      <style>{`
        .responsive-container {
          display: flex;
          flex-direction: row;
          gap: 30px;
          max-width: 1240px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .responsive-main {
          flex: 1;
          min-width: 0; /* CRITICAL: Prevents the Flexbox Blowout from the slider */
          overflow: hidden; /* CRITICAL: Keeps everything inside the boundaries */
        }
        .responsive-sidebar {
          width: 320px;
          flex-shrink: 0;
        }

        /* When screen gets smaller than 1024px, stack them! */
        @media (max-width: 1024px) {
          .responsive-container {
            flex-direction: column;
            padding: 20px 15px;
          }
          .responsive-sidebar {
            width: 100%; /* Sidebar takes full width at the bottom */
          }
        }
      `}</style>

      <div style={styles.pageWrapper}>
        <div className="responsive-container">
          
          <div className="responsive-main">
            <TrackSlider 
              title="More of what you like" 
              subtitle="Suggestions based on your recent plays"
              tracks={data.moreOfWhatYouLike} 
            />

            <RecentlyPlayedGrid items={data.recentlyPlayed} />

            <TrackSlider 
              title={`Mixed for ${username}`} 
              subtitle="Your personal daily music update"
              tracks={data.mixedForUser} 
              showFollow={false} 
            />

            <TrackSlider 
              title="Discover with stations" 
              subtitle="Pick a track and we'll play similar music"
              tracks={data.discoverStations} 
              showFollow={false} 
            />
          </div>

          <div className="responsive-sidebar">
            <RightSidebar 
              followSuggestions={data.followSuggestions}
              listeningHistory={data.listeningHistory}
            />
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    backgroundColor: '#121212', 
    minHeight: '100vh',
    width: '100%',
    overflowX: 'hidden', // Extra safety net
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