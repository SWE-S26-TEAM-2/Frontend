
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Heart,
  Repeat,
  Play,
  MoreHorizontal,
  Pause,
  Share2,
  Link2,
  ListMusic,
  Repeat2
} from 'lucide-react';
import { ITrack } from '../../types/track.types';
import { usePlayerStore } from '@/store/playerStore';

/* =========================
   MORE MENU (PORTAL)
========================= */
const MoreMenu = ({
  onClose,
  anchorRect,
  buttonRef
}: {
  onClose: () => void;
  anchorRect: DOMRect;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;

      if (buttonRef.current?.contains(target)) return;

      if (ref.current && !ref.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, buttonRef]);

  const items = [
    { icon: <Repeat2 size={12} />, label: 'Repost' },
    { icon: <Share2 size={12} />, label: 'Share' },
    { icon: <Link2 size={12} />, label: 'Copy Link' },
    { icon: <ListMusic size={12} />, label: 'Add to Queue' }
  ];

  const leftPos = Math.min(anchorRect.left + 20, window.innerWidth - 160);

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: anchorRect.bottom + 8,
        left: leftPos,
        zIndex: 99999
      }}
      className="bg-neutral-950 border border-neutral-800 rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-[11px] text-neutral-300 hover:bg-neutral-800 hover:text-white transition text-left border-none cursor-pointer bg-transparent min-w-[140px]"
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
};

export default function ListeningHistory({ history }: { history: ITrack[] }) {
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();

  const [likedTracks, setLikedTracks] = useState<Record<string, boolean>>({});
  const [repostedTracks, setRepostedTracks] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [repostCounts, setRepostCounts] = useState<Record<string, number>>({});

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const initialLikes: Record<string, number> = {};
    const initialReposts: Record<string, number> = {};

    history.forEach((track) => {
      initialLikes[track.id] = Number(track.likes || 0);
      initialReposts[track.id] = 0; // since ITrack has no reposts property
    });

    setLikeCounts(initialLikes);
    setRepostCounts(initialReposts);
  }, [history]);

  const handlePlayClick = (item: ITrack) => {
    if (currentTrack?.id === item.id) {
      togglePlay();
    } else {
      setTrack(item);
    }
  };

  const toggleLike = (id: string) => {
    const isLiked = likedTracks[id];

    setLikedTracks((prev) => ({
      ...prev,
      [id]: !isLiked
    }));

    setLikeCounts((prev) => ({
      ...prev,
      [id]: isLiked ? prev[id] - 1 : prev[id] + 1
    }));
  };

  const toggleRepost = (id: string) => {
    const isReposted = repostedTracks[id];

    setRepostedTracks((prev) => ({
      ...prev,
      [id]: !isReposted
    }));

    setRepostCounts((prev) => ({
      ...prev,
      [id]: isReposted ? prev[id] - 1 : prev[id] + 1
    }));
  };

  const handleToggleMenu = (
    e: React.MouseEvent,
    id: string,
    button: HTMLButtonElement | null
  ) => {
    e.stopPropagation();

    if (button) {
      setAnchorRect(button.getBoundingClientRect());
    }

    setMenuOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <span style={styles.title}>Listening history</span>
        <button className="view-all" style={styles.headerBtn}>
          View all
        </button>
      </div>

      {history.map((item) => {
        const isCurrent = currentTrack?.id === item.id;
        const showPause = isCurrent && isPlaying;
        const liked = likedTracks[item.id];
        const reposted = repostedTracks[item.id];

        return (
          <div key={item.id} className="history-item" style={styles.historyRow}>
            <div
              style={styles.artWrapper}
              className="art-wrapper"
              onClick={() => handlePlayClick(item)}
            >
              <img
                src={item.albumArt || '/test.png'}
                style={styles.albumArt}
                alt={item.title}
              />

              <div
                className="play-overlay"
                style={{
                  ...styles.playOverlay,
                  opacity: isCurrent ? 1 : undefined
                }}
              >
                {showPause ? (
                  <Pause size={16} fill="white" color="white" />
                ) : (
                  <Play size={16} fill="white" color="white" />
                )}
              </div>
            </div>

            <div style={styles.details}>
              <span style={styles.artistLabel}>{item.artist}</span>

              <span
                className="track-name"
                style={{
                  ...styles.songName,
                  color: isCurrent ? '#f50' : '#ccc'
                }}
              >
                {item.title}
              </span>

              <div style={styles.statsRow}>
                <span style={styles.stat}>
                  <Play size={10} /> {item.plays || '0'}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(item.id);
                  }}
                  style={{
                    ...styles.actionBtn,
                    color: liked ? '#f50' : '#555'
                  }}
                >
                  <Heart
                    size={10}
                    fill={liked ? '#f50' : 'transparent'}
                  />
                  {likeCounts[item.id] || 0}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRepost(item.id);
                  }}
                  style={{
                    ...styles.actionBtn,
                    color: reposted ? '#f50' : '#555'
                  }}
                >
                  <Repeat size={10} />
                  {repostCounts[item.id] || 0}
                </button>
              </div>
            </div>

            <button
              ref={(el) => {
                buttonRefs.current[item.id] = el;
              }}
              className="more-btn"
              style={styles.moreBtn}
              onClick={(e) =>
                handleToggleMenu(e, item.id, buttonRefs.current[item.id])
              }
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpenId === item.id && anchorRect && (
              <MoreMenu
                anchorRect={anchorRect}
                buttonRef={{ current: buttonRefs.current[item.id] }}
                onClose={() => setMenuOpenId(null)}
              />
            )}
          </div>
        );
      })}

      <style jsx>{`
        .history-item {
          position: relative;
          cursor: default;
        }

        .art-wrapper {
          cursor: pointer;
        }

        .play-overlay {
          cursor: pointer;
        }

        .art-wrapper:hover .play-overlay {
          opacity: 1 !important;
        }

        .history-item:hover .track-name {
          color: white !important;
        }

        .history-item:hover .more-btn {
          opacity: 1;
        }

        .view-all:hover {
          text-decoration: underline;
          color: white !important;
        }

        .more-btn {
          opacity: 0;
          background: none;
          border: 1px solid #333;
          color: #888;
          border-radius: 4px;
          padding: 4px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: {
    padding: '20px',
    borderBottom: '1px solid #222'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  title: {
    color: '#888',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  headerBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '11px',
    cursor: 'pointer'
  },
  historyRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
    alignItems: 'flex-start'
  },
  artWrapper: {
    position: 'relative',
    width: '48px',
    height: '48px',
    flexShrink: 0,
    cursor: 'pointer'
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  albumArt: {
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    objectFit: 'cover',
    backgroundColor: '#333'
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0
  },
  artistLabel: {
    color: '#777',
    fontSize: '10px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  songName: {
    color: '#ccc',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'color 0.2s',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  statsRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
    alignItems: 'center'
  },
  stat: {
    color: '#555',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  actionBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    cursor: 'pointer',
    transition: 'color 0.2s',
    padding: 0
  },
  moreBtn: {
    opacity: 0,
    background: 'none',
    border: '1px solid #333',
    color: '#888',
    borderRadius: '4px',
    padding: '2px',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  }
};
