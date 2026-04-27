"use client";

import React, { useEffect, useState } from 'react';
import TrackSlider from '../../../components/Track/TrackSlider';
import RecentlyPlayedGrid from '../../../components/Home/RecentlyPlayed';
import RightSidebar from '../../../components/Home/SideBar';
import StationSlider from '../../../components/Station/StationSlider';
import { homeService } from '@/services';
import { stationService } from '@/services';
import { IHomePageData } from '../../../types/home.types';
import type { IStation } from '@/types/station.types';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';

export default function HomePage() {
  const [data, setData]                   = useState<IHomePageData | null>(null);
  const [discoverStations, setDiscoverStations] = useState<IStation[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const username = "User";

  useEffect(() => {
    const loadData = async () => {
      try {
        const [homeData, stations] = await Promise.all([
          homeService.getHomePageData(username),
          stationService.getDiscoverStations(),
        ]);
        setData(homeData);
        setDiscoverStations(stations);
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
      <Header />

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
          min-width: 0;
          overflow: hidden;
        }
        .responsive-sidebar {
          width: 320px;
          flex-shrink: 0;
        }
        @media (max-width: 1024px) {
          .responsive-container {
            flex-direction: column;
            padding: 20px 15px;
          }
          .responsive-sidebar {
            width: 100%;
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

            {/* Stations slider — replaces old discoverStations TrackSlider */}
            <StationSlider
              title="Discover with stations"
              subtitle="Pick a track and we'll play similar music"
              stations={discoverStations}
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
    overflowX: 'hidden',
  },
  loadingWrapper: {
    backgroundColor: '#121212',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ccc',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
  },
  spinner: {
    padding: '20px',
    border: '1px solid #333',
    borderRadius: '8px',
    backgroundColor: '#1a1a1a',
  },
};
