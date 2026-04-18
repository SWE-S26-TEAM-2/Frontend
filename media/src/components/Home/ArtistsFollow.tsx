"use client";
import React, { useState } from 'react';
import { RotateCw, Users } from 'lucide-react';
import { IArtist } from '../../types/home.types';

export default function ArtistsFollow({ artists }: { artists: IArtist[] }) {
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleFollow = (id: string) => {
    setFollowingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <span style={styles.title}>Artists you should follow</span>
        <button onClick={handleRefresh} className="refresh-btn" style={styles.headerBtn}>
          <RotateCw size={12} className={isRefreshing ? "spin" : ""} style={{ marginRight: '4px' }} /> 
          Refresh list
        </button>
      </div>

      {artists.map(artist => {
        const isFollowing = followingIds.has(artist.id);
        return (
          <div key={artist.id} className="artist-row" style={styles.row}>
            <img src={artist.imageUrl} style={styles.avatar} alt={artist.name} />
            <div style={styles.info}>
              <span className="artist-name" style={styles.name}>{artist.name}</span>
              <div style={styles.subStats}>
                <Users size={10} style={{ marginRight: '3px' }} /> 
                {artist.followers} • {artist.tracksCount} tracks
              </div>
            </div>
            <button 
              onClick={() => toggleFollow(artist.id)}
              className={isFollowing ? "follow-btn following" : "follow-btn"}
              style={{
                ...styles.followBtn,
                backgroundColor: isFollowing ? 'transparent' : 'white',
                color: isFollowing ? '#fff' : 'black',
                border: isFollowing ? '1px solid #444' : 'none',
              }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        );
      })}

      {/* FIXED HOVER CSS BLOCK */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        
        .refresh-btn:hover { color: white !important; }
        .artist-row:hover .artist-name { color: #f50 !important; cursor: pointer; }

        /* Follow Button Hover Logic */
        .follow-btn { transition: all 0.2s ease-in-out !important; }
        
        /* Hover state for "Follow" (White button) */
        .follow-btn:not(.following):hover { 
          background-color: #e5e5e5 !important; 
          transform: scale(1.03);
        }

        /* Hover state for "Following" (Transparent button) */
        .follow-btn.following:hover { 
          border-color: #fff !important;
          background-color: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: { padding: '20px', borderBottom: '1px solid #222' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  title: { color: '#888', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' },
  headerBtn: { background: 'none', border: 'none', color: '#888', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'color 0.2s' },
  row: { display: 'flex', alignItems: 'center', marginBottom: '14px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px', objectFit: 'cover' },
  info: { flex: 1, display: 'flex', flexDirection: 'column' },
  name: { color: 'white', fontSize: '13px', fontWeight: '600', transition: 'color 0.2s' },
  subStats: { color: '#666', fontSize: '10px', marginTop: '2px', display: 'flex', alignItems: 'center' },
  followBtn: { borderRadius: '4px', padding: '4px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }
};