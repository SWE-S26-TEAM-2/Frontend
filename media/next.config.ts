import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  /**
   * Playwright starts `next dev` with PLAYWRIGHT_FORCE_MOCK=1 so the client bundle
   * consistently uses mock services (Turbopack may not always forward arbitrary env).
   */
  env:
    process.env.PLAYWRIGHT_FORCE_MOCK === "1"
      ? { NEXT_PUBLIC_USE_MOCK_API: "true" }
      : {},
  turbopack: {
    root: currentDir,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Allow Google OAuth popup to postMessage back to parent
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "streamline-swp.duckdns.org",
      },
       {
        protocol: "https",
        hostname: "res.cloudinary.com",  
      },
    ],
  },
};

export default nextConfig;
