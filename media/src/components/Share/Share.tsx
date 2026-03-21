"use client";

import React, { useState, useEffect, useRef } from "react";

interface IShareModalProps {
  username: string;
  onClose: () => void;
}

export function ShareModal({ username, onClose }: IShareModalProps) {
  const [isShortenLink, setIsShortenLink] = useState(false);
  const [isCopied, setIsCopied]           = useState(false);
  const overlayRef                    = useRef<HTMLDivElement>(null);

  const fullUrl      = `${window.location.origin}/${username}?utm_source=clipboard&utm_medium=text`;
  const shortenedUrl = `${window.location.origin}/${username}`;
  const displayUrl   = isShortenLink ? shortenedUrl : fullUrl;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(displayUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch { /* silent */ }
  }

  const encoded = encodeURIComponent(displayUrl);
  const name    = encodeURIComponent(username);

  const socials = [
    {
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${name}`,
      bg: "#1da1f2",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      bg: "#1877f2",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8.615v-6.96h-2.338v-2.725h2.338v-2c0-2.325 1.42-3.592 3.5-3.592.699-.002 1.399.034 2.095.107v2.42h-1.435c-1.128 0-1.348.538-1.348 1.325v1.735h2.697l-.35 2.725h-2.348V21H20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"/>
        </svg>
      ),
    },
    {
      label: "Tumblr",
      href: `https://www.tumblr.com/share/link?url=${encoded}&name=${name}`,
      bg: "#35465c",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.323 1.406z"/>
        </svg>
      ),
    },
    {
      label: "Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${encoded}&description=${name}`,
      bg: "#e60023",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
        </svg>
      ),
    },
    {
      label: "Email",
      href: `mailto:?subject=${name}&body=${encoded}`,
      bg: "#555",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      ),
    },
  ];

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-start justify-center"
      style={{ paddingTop: "clamp(80px, 15vh, 160px)" }}
    >
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg w-120 shadow-2xl overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a2a]">
          <button className="px-5 py-3.5 text-sm font-semibold text-white border-b-2 border-[#ff5500] bg-transparent cursor-default">
            Share
          </button>
          <button className="px-5 py-3.5 text-sm text-[#888] bg-transparent border-b-2 border-transparent hover:text-[#ccc] transition-colors cursor-pointer">
            Message
          </button>
        </div>

        {/* Social icons */}
        <div className="flex gap-3 px-5 py-5">
          {socials.map(s => (
            <a
              key={s.label}
              href={s.href}
              target={s.label === "Email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={`Share on ${s.label}`}
              className="w-11 h-11 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
              style={{ backgroundColor: s.bg }}
            >
              {s.icon}
            </a>
          ))}
        </div>

        {/* URL bar */}
        <div className="px-5 pb-3">
          <div
            onClick={handleCopy}
            title="Click to copy"
            className="flex items-center bg-[#111] border border-[#333] rounded px-3 py-2.5 cursor-pointer hover:border-[#555] transition-colors group"
          >
            <span className="flex-1 text-xs text-[#aaa] truncate font-mono select-none">
              {displayUrl}
            </span>
            <span className="ml-3 text-xs whitespace-nowrap text-[#666] group-hover:text-[#aaa] transition-colors">
              {isCopied ? "✓ Copied!" : "Copy"}
            </span>
          </div>
        </div>

        {/* Shorten link */}
        <div className="px-5 pb-5 flex items-center gap-2">
          <input
            id="shorten-link"
            type="checkbox"
            checked={isShortenLink}
            onChange={e => setIsShortenLink(e.target.checked)}
            className="w-4 h-4 accent-[#ff5500] cursor-pointer"
          />
          <label htmlFor="shorten-link" className="text-sm text-[#aaa] cursor-pointer select-none">
            Shorten link
          </label>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-[#666] hover:text-white bg-transparent border-none cursor-pointer rounded transition-colors hover:bg-[#333]"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
            <path d="M14 1.41L12.59 0 7 5.59 1.41 0 0 1.41 5.59 7 0 12.59 1.41 14 7 8.41 12.59 14 14 12.59 8.41 7z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}