"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ArtistTools from './ArtistsTools';
import ArtistsFollow from './ArtistsFollow';
import ListeningHistory from './ListeningHistory';
import HoverButton from '../../components/HoverButton/HoverButton';
import { IArtist } from '../../types/home.types';
import { ITrack } from '../../types/track.types';
interface RightSidebarProps {
  followSuggestions: IArtist[];
  listeningHistory: ITrack[];
}

const RightSidebar = ({ followSuggestions, listeningHistory }: RightSidebarProps) => {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.scrollableContent} className="custom-scrollbar">
        <ArtistTools />
        <ArtistsFollow artists={followSuggestions} />
        <ListeningHistory history={listeningHistory} />
        
        <div style={styles.mobileSection}>
          <h3 style={contentStyles.sidebarTitle}>Go Mobile</h3>
          <div style={contentStyles.appButtons}>
            <Link href="https://apps.apple.com" target="_blank">
              <HoverButton style={styles.storeBtn}>
                <Image src="/apple.jpg" alt="App Store" width={140} height={42} priority />
              </HoverButton>
            </Link>
            <Link href="https://play.google.com" target="_blank">
              <HoverButton style={styles.storeBtn}>
                <Image src="/playstore.png" alt="Play Store" width={140} height={42} priority />
              </HoverButton>
            </Link>
          </div>
        </div>
        
        <div style={styles.footer}>
          <div style={styles.footerLinks}>
            {['Legal', 'Privacy', 'Cookies', 'Imprint', 'Charts', 'Newsroom'].map((link) => (
              <a key={link} href="#" className="footer-link">{link}</a>
            ))}
          </div>
          <p style={{ marginTop: '12px' }}>Language: English (US)</p>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .footer-link { 
          color: #666; 
          text-decoration: none; 
          margin: 0 4px; 
          transition: color 0.2s;
        }
        .footer-link:hover { color: #aaa; text-decoration: underline; }
      `}</style>
    </aside>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: '100%',
    height: '100vh',
    position: 'sticky',
    top: 0,
    backgroundColor: '#121212',
    borderLeft: '1px solid #222',
  },
  scrollableContent: {
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  mobileSection: { padding: '20px' },
  storeBtn: { padding: 0, border: 'none', background: 'none', display: 'block', cursor: 'pointer' },
  footer: {
    padding: '20px',
    fontSize: '11px',
    color: '#444',
    borderTop: '1px solid #222',
    textAlign: 'left',
  },
  footerLinks: { display: 'flex', flexWrap: 'wrap', gap: '4px' }
};

const contentStyles: { [key: string]: React.CSSProperties } = {
  sidebarTitle: { fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' },
  appButtons: { display: 'flex', flexDirection: 'column', gap: '10px' }
};

export default RightSidebar;