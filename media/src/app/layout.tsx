import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers/Providers";

export const metadata: Metadata = {
  title: "SoundCloud Clone",
  description: "SoundCloud Clone — SWE S2026 Team 2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
        );
}