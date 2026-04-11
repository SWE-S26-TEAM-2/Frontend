"use client";

import React, { useState } from 'react';
import { 
  ChevronDown, ChevronUp, Radio, Share2, 
  Zap, DollarSign, Star, MessageCircle, 
  Globe, TrendingUp, Award 
} from 'lucide-react';

interface ToolItem {
  icon: React.ReactNode;
  label: string;
  isGold?: boolean;
}

const ArtistTools = () => {
  const [isOpen, setIsOpen] = useState(false);

  const allTools: ToolItem[] = [
    /* Increased Icon Size to 24 */
    { icon: <Radio size={24} />, label: "Amplify" },
    { icon: <Share2 size={24} />, label: "Distribute" },
    { icon: <Zap size={24} />, label: "Master" },
    { icon: <DollarSign size={24} />, label: "Monetize" },
    { icon: <Star size={24} />, label: "Spotlight" },
    { icon: <TrendingUp size={24} />, label: "Top Fans" },
    { icon: <MessageCircle size={24} />, label: "Comments", isGold: true },
    { icon: <Globe size={24} />, label: "Network", isGold: true },
  ];

  const visibleTools = isOpen ? allTools : allTools.slice(0, 4);

  return (
    <div style={styles.container}>
      <div style={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <span style={styles.title}>Artist Tools</span>
        {isOpen ? <ChevronUp size={18} color="#999" /> : <ChevronDown size={18} color="#999" />}
      </div>

      <div style={styles.grid}>
        {visibleTools.map((tool, index) => (
          <ToolCard key={index} tool={tool} />
        ))}
      </div>

      <div style={styles.proBanner}>
        <Award size={20} color="white" style={{ flexShrink: 0 }} />
        <span style={styles.bannerText}>
          Unlock Artist tools from EGP 29.99/month.
        </span>
      </div>
    </div>
  );
};

const ToolCard = ({ tool }: { tool: ToolItem }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={styles.cardWrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.iconWrapper}>{tool.icon}</div>
      <div style={styles.labelContainer}>
        {isHovered ? (
          <span style={{ 
            ...styles.upgradeBadge, 
            backgroundColor: tool.isGold ? '#dcc034' : '#A020F0',
            color: tool.isGold ? '#000' : '#fff'
          }}>
            UPGRADE
          </span>
        ) : (
          <span style={styles.toolLabel}>{tool.label}</span>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px', // Increased padding
    backgroundColor: 'transparent',
    width: '100%',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    paddingBottom: '14px',
    marginBottom: '20px',
    color: '#fff',
    borderBottom: '1px solid #333',
  },
  title: { 
    fontSize: '14px', // Scaled up from 12px
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: '1px' 
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px', // Increased gap for the wider sidebar
    marginBottom: '20px',
  },
  cardWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    width: '100%',
    aspectRatio: '1/1', 
    backgroundColor: '#1a1a1a',
    border: '1px solid #282828',
    borderRadius: '10px', // Slightly smoother corners for larger squares
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  iconWrapper: { color: 'white', marginBottom: '8px', display: 'flex' },
  labelContainer: { height: '18px', display: 'flex', alignItems: 'center' },
  toolLabel: { 
    fontSize: '11px', // Scaled up from 9px
    color: '#aaa',     // Slightly brighter for better legibility
    fontWeight: '500' 
  },
  upgradeBadge: { 
    fontSize: '9px', // Scaled up from 7px
    fontWeight: '800', 
    padding: '2px 6px', 
    borderRadius: '3px' 
  },
  proBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#A020F0',
    padding: '14px', // More padding for the bigger layout
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  bannerText: {
    color: 'white',
    fontSize: '12px', // Scaled up from 10px
    fontWeight: '600',
    lineHeight: '1.4',
  }
};

export default ArtistTools;