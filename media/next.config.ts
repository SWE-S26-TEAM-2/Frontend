/**
 * @file next.config.ts
 * @description Next.js configuration.
 *
 * REMOTE IMAGE DOMAINS:
 * - i.pravatar.cc   — existing (header avatar, mock user data)
 * - images.unsplash.com — playlist feature mock cover images
 *
 * When backend supplies real image URLs (e.g., S3 or CDN), add the
 * hostname here and remove the unsplash entry if no longer needed.
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        // Used by playlist mock data during development.
        // Remove once backend supplies real asset URLs.
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
