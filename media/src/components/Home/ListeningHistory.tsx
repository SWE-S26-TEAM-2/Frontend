"use client";
import React from 'react';
import { Heart, Repeat, MessageSquare, Play, MoreHorizontal, Pause } from 'lucide-react';
import { ITrack } from '../../types/track.types'; // Updated import to Master Type
import { usePlayerStore } from '@/store/playerStore'; // Hook into your music engine

export default function ListeningHistory({ history }: { history: ITrack[] }) {
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();

  const handlePlayClick = (item: ITrack) => {
    if (currentTrack?.id === item.id) {
      togglePlay();
    } else {
      setTrack(item);
    }
  };

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <span style={styles.title}>Listening history</span>
        <button className="view-all" style={styles.headerBtn}>View all</button>
      </div>

      {history.map(item => {
        const isCurrent = currentTrack?.id === item.id;
        const showPause = isCurrent && isPlaying;

        return (
          <div key={item.id} className="history-item" style={styles.historyRow}>
            <div 
              style={styles.artWrapper} 
              className="art-wrapper"
              onClick={() => handlePlayClick(item)}
            >
              {/* Updated to albumArt to match Master Type */}
              <img src={item.albumArt || "/test.png"} style={styles.albumArt} alt={item.title} />
              <div className="play-overlay" style={{
                ...styles.playOverlay,
                opacity: isCurrent ? 1 : undefined // Keep overlay visible if currently playing
              }}>
                {showPause ? (
                  <Pause size={16} fill="white" color="white" />
                ) : (
                  <Play size={16} fill="white" color="white" />
                )}
              </div>
            </div>
            
            <div style={styles.details}>
              <span style={styles.artistLabel}>{item.artist}</span>
              <span className="track-name" style={{
                ...styles.songName,
                color: isCurrent ? '#f50' : '#ccc' // Highlight if active
              }}>{item.title}</span>
              <div style={styles.statsRow}>
                {/* Fixed stat mappings to match ITrack properties */}
                <span style={styles.stat}><Play size={10} /> {item.plays || '0'}</span>
                <span style={styles.stat} className="stat-hover"><Heart size={10} /> {item.likes || '0'}</span>
                <span style={styles.stat} className="stat-hover"><Repeat size={10} /></span>
                <span style={styles.stat} className="stat-hover"><MessageSquare size={10} /></span>
              </div>
            </div>

            <button className="more-btn" style={styles.moreBtn}>
              <MoreHorizontal size={14} />
            </button>
          </div>
        );
      })}

      <style jsx>{`
        .history-item { position: relative; cursor: pointer; }
        .art-wrapper:hover .play-overlay { opacity: 1 !important; }
        .history-item:hover .track-name { color: white !important; }
        .history-item:hover .more-btn { opacity: 1; }
        .stat-hover:hover { color: #f50 !important; }
        .view-all:hover { text-decoration: underline; color: white !important; }
        .more-btn { 
          opacity: 0; background: none; border: 1px solid #333; color: #888; 
          border-radius: 4px; padding: 2px; cursor: pointer; transition: opacity 0.2s;
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: { padding: '20px', borderBottom: '1px solid #222' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  title: { color: '#888', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' },
  headerBtn: { background: 'none', border: 'none', color: '#888', fontSize: '11px', cursor: 'pointer' },
  historyRow: { display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' },
  artWrapper: { position: 'relative', width: '48px', height: '48px', flexShrink: 0 },
  playOverlay: { 
    position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', 
    opacity: 0, transition: 'opacity 0.2s', borderRadius: '4px' 
  },
  albumArt: { width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover', backgroundColor: '#333' },
  details: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 },
  artistLabel: { color: '#777', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  songName: { color: '#ccc', fontSize: '12px', fontWeight: '500', transition: 'color 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  statsRow: { display: 'flex', gap: '8px', marginTop: '4px' },
  stat: { color: '#555', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px', transition: 'color 0.2s' }
};