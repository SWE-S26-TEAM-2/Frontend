'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import TrackSlider from '../../../components/Track/TrackSlider';
import {
  MOCK_CURATED,
  MOCK_EMERGING,
  MOCK_POWER,
} from '../../../services/mocks/trending.mock';
import Footer from '../../../components/Footer/Footer';
import LoginModal from '../../../components/LoginModal/LoginModal';
import HoverButton from '@/components/HoverButton/HoverButton';
import Image from 'next/image';

// ── ICONS ───────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#666"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SoundCloudLogo = () => (
  <svg
    viewBox="-2 0 32 32"
    width="28"
    height="28"
    fill="white"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M23.2 22.68h-10.12c-0.28 0-0.56-0.16-0.72-0.4-0.080-0.12-0.12-0.32-0.12-0.48v-10.76c0-0.28 0.16-0.56 0.4-0.72 1.040-0.64 2.28-1 3.52-1 2.92 0 5.48 1.88 6.36 4.64 0.24-0.040 0.48-0.080 0.72-0.080 2.4 0 4.4 1.96 4.4 4.4s-2.040 4.4-4.44 4.4zM13.92 20.96h9.28c1.48 0 2.68-1.2 2.68-2.68s-1.2-2.68-2.68-2.68c-0.36 0-0.72 0.080-1.040 0.2-0.24 0.080-0.52 0.080-0.72-0.040-0.24-0.12-0.4-0.36-0.44-0.6-0.4-2.4-2.48-4.12-4.88-4.12-0.76 0-1.52 0.16-2.2 0.52v9.4zM10.84 21.8v-8.68c0-0.48-0.4-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v8.72c0 0.48 0.4 0.84 0.84 0.84s0.84-0.4 0.84-0.88zM7.8 21.8v-9c0-0.48-0.4-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v9.040c0 0.48 0.4 0.84 0.84 0.84s0.84-0.4 0.84-0.88zM4.76 21.8v-6.48c0-0.48-0.4-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v6.52c0 0.48 0.4 0.84 0.84 0.84s0.84-0.4 0.84-0.88zM1.72 21.32v-5.32c0-0.48-0.4-0.84-0.84-0.84s-0.88 0.36-0.88 0.84v5.32c0 0.48 0.4 0.84 0.84 0.84s0.88-0.36 0.88-0.84z" />
  </svg>
);

const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

// ── MENU DATA ────────────────────────────────────────────────────────────────

const DOTS_MENU = [
  { label: 'About us', href: '/about' },
  { label: 'Legal', href: '/legal' },
  { label: 'Copyright', href: '/copyright' },
  { label: 'Mobile apps', href: '/mobile', dividerBefore: true },
  { label: 'Artist Membership', href: '/membership' },
  { label: 'Newsroom', href: '/newsroom' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Developers', href: '/developers' },
  { label: 'SoundCloud Store', href: '/store' },
  { label: 'Support', href: '/support', dividerBefore: true },
  { label: 'Keyboard shortcuts', href: '/shortcuts' },
];

export default function TrendingPage() {
  const [activeNav, setActiveNav] = useState('Home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [dotsOpen, setDotsOpen] = useState(false);
  const [langHover, setLangHover] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dotsRef.current && !dotsRef.current.contains(e.target as Node))
        setDotsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const footerLinks = [
    'Legal',
    'Privacy',
    'Cookie Policy',
    'Imprint',
    'Charts',
    'Artist Resources',
    'Newsroom',
    'Transparency Reports',
  ];

  return (
    <div
      style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff' }}
    >
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}

      <header style={headerStyles.header}>
        <div style={headerStyles.container}>
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Link href="/" style={headerStyles.logo}>
              <SoundCloudLogo />
              <span style={headerStyles.logoText}>soundcloud</span>
            </Link>

            <nav style={headerStyles.nav}>
              {['Home', 'Feed', 'Library'].map((item) => (
                <HoverButton
                  key={item}
                  onClick={() =>
                    item === 'Home'
                      ? setActiveNav('Home')
                      : setIsLoginOpen(true)
                  }
                  style={{
                    ...headerStyles.navLink,
                    color: activeNav === item ? '#fff' : '#aaa',
                    borderBottom:
                      activeNav === item
                        ? '2px solid #ff5500'
                        : '2px solid transparent',
                  }}
                >
                  {item}
                </HoverButton>
              ))}
            </nav>
          </div>

          <div style={headerStyles.searchCenterWrapper}>
            <div style={headerStyles.searchBox}>
              <input
                type="text"
                placeholder="Search for artists, bands, tracks..."
                style={headerStyles.searchInput}
              />
              <SearchIcon />
            </div>
          </div>

          <div style={headerStyles.authSection}>
            <HoverButton
              style={headerStyles.signInBtn}
              onClick={() => setIsLoginOpen(true)}
            >
              Sign in
            </HoverButton>

            <HoverButton
              style={headerStyles.createBtn}
              onClick={() => setIsLoginOpen(true)}
            >
              Create account
            </HoverButton>

            <HoverButton style={headerStyles.uploadLink} onClick={() => {}}>
              Upload
            </HoverButton>

            <div
              ref={dotsRef}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <HoverButton
                style={headerStyles.dotsBtn}
                onClick={() => setDotsOpen(!dotsOpen)}
              >
                <DotsIcon />
              </HoverButton>

              {dotsOpen && (
                <div style={dropdownStyles.wrapper}>
                  {DOTS_MENU.map((item, i) => (
                    <React.Fragment key={i}>
                      {item.dividerBefore && (
                        <div style={dropdownStyles.divider} />
                      )}
                      <Link href={item.href} style={{ textDecoration: 'none' }}>
                        <HoverButton
                          style={dropdownStyles.link}
                          onClick={() => setDotsOpen(false)}
                        >
                          {item.label}
                        </HoverButton>
                      </Link>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div style={contentStyles.pageWrapper}>
        <div style={contentStyles.contentContainer}>
          <main style={contentStyles.leftCol}>
            <h1 style={contentStyles.mainTitle}>
              Discover Tracks and Playlists
            </h1>

            <section style={contentStyles.sliderSection}>
              <TrackSlider
                title="Curated by SoundCloud"
                subtitle="Hand-picked for you"
                tracks={MOCK_CURATED}
              />
            </section>

            <section style={contentStyles.sliderSection}>
              <TrackSlider
                title="Artists to watch out for"
                subtitle="Trending now"
                tracks={MOCK_EMERGING}
              />
            </section>

            {/* RESTORED COMPONENT */}
            <section style={contentStyles.sliderSection}>
              <TrackSlider
                title="SoundCloud's Power Playlists"
                subtitle="The best of the best"
                tracks={MOCK_POWER}
              />
            </section>
          </main>

          <aside style={contentStyles.rightCol}>
            <div style={contentStyles.fixedSidebar}>
              <div>
                <h3 style={contentStyles.sidebarTitle}>Go Mobile</h3>
                <div style={contentStyles.appButtons}>
                  <Link
                    href="https://apps.apple.com"
                    target="_blank"
                    style={{ textDecoration: 'none' }}
                  >
                    <HoverButton
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'none',
                        display: 'block',
                      }}
                    >
                      <Image
                        src="/apple.jpg"
                        alt="App Store"
                        width={140}
                        height={42}
                        style={contentStyles.storeImage}
                        priority
                      />{' '}
                    </HoverButton>
                  </Link>
                  <Link
                    href="https://play.google.com"
                    target="_blank"
                    style={{ textDecoration: 'none' }}
                  >
                    <HoverButton
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'none',
                        display: 'block',
                      }}
                    >
                      <Image
                        src="/playstore.png"
                        alt="Play Store"
                        width={140}
                        height={42}
                        style={contentStyles.storeImage}
                        priority
                      />{' '}
                    </HoverButton>
                  </Link>
                </div>
              </div>

              <div style={contentStyles.legalSection}>
                <div style={contentStyles.sidebarLinksGrid}>
                  {footerLinks.map((link) => (
                    <HoverButton
                      key={link}
                      style={contentStyles.sidebarFooterLink}
                    >
                      {link}
                    </HoverButton>
                  ))}
                </div>

                <div style={{ marginTop: '20px' }}>
                  <span style={{ color: '#f1eded', fontSize: '13px' }}>
                    Language:{' '}
                  </span>
                  <span
                    onMouseEnter={() => setLangHover(true)}
                    onMouseLeave={() => setLangHover(false)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: langHover ? '#ff5500' : '#868484',
                      textDecoration: langHover ? 'underline' : 'none',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    English (US)
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ── STYLES ──────────────────────────────────────────────────────────────────

const headerStyles: { [key: string]: React.CSSProperties } = {
  header: {
    height: '60px',
    backgroundColor: '#121212',
    display: 'flex',
    justifyContent: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: '1px solid #222',
  },
  container: {
    width: '100%',
    maxWidth: '1240px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    marginRight: '20px',
  },
  logoText: {
    color: 'white',
    fontSize: '16px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  nav: { display: 'flex', height: '60px' },
  navLink: {
    background: 'none',
    border: 'none',
    padding: '0 15px',
    fontSize: '14px',
    fontWeight: 500,
    height: '100%',
  },
  searchCenterWrapper: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    padding: '0 25px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: '#252525',
    borderRadius: '4px',
    padding: '0 12px',
    width: '100%',
    maxWidth: '480px',
    height: '34px',
    border: '1px solid #333',
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    outline: 'none',
    fontSize: '13px',
    width: '100%',
  },
  authSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  signInBtn: {
    background: 'transparent',
    color: 'white',
    border: 'none',
    fontSize: '13px',
    fontWeight: 900,
  },
  createBtn: {
    background: '#ffffff',
    color: '#000000',
    border: '1px solid #ccc',
    padding: '5px 12px',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: 550,
  },
  uploadLink: {
    color: '#9b9a9a',
    border: 'none',
    background: 'none',
    fontSize: '14px',
  },
  dotsBtn: {
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    color: '#999',
  },
};

const dropdownStyles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    position: 'absolute',
    top: 'calc(100% + 15px)',
    right: 0,
    background: '#303030',
    border: '1px solid #505050',
    borderRadius: '4px',
    minWidth: '200px',
    zIndex: 999,
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  divider: { height: '1px', background: '#505050', margin: '0' },
  link: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    color: '#ddd',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    fontSize: '14px',
    fontWeight: 500,
  },
};

const contentStyles: { [key: string]: React.CSSProperties } = {
  pageWrapper: { padding: '20px 0 60px 0', width: '100%' },
  contentContainer: {
    maxWidth: '1240px',
    margin: '0 auto',
    display: 'flex',
    gap: '30px',
    padding: '0 20px',
  },
  leftCol: { flex: 1, minWidth: 0 },
  mainTitle: {
    color: 'white',
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '1px solid #222',
  },
  sliderSection: { marginBottom: '40px' },
  rightCol: { width: '300px', flexShrink: 0 },
  fixedSidebar: {
    position: 'sticky',
    top: '80px',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  sidebarTitle: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '15px',
    fontFamily: '-apple-system',
  },
  appButtons: { display: 'flex', flexDirection: 'column', gap: '10px' },
  storeImage: { width: '140px', borderRadius: '8px', display: 'block' },
  legalSection: { borderTop: '1px solid #222', paddingTop: '20px' },
  sidebarLinksGrid: { display: 'flex', flexWrap: 'wrap', gap: '6px 10px' },
  sidebarFooterLink: {
    background: 'none',
    border: 'none',
    color: '#b8b6b6',
    fontSize: '13px',
    padding: 0,
    textAlign: 'left',
    fontWeight: 500,
  },
};
