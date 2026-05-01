"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ThemeProvider from "@/components/Providers/ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    const content = (
        <ThemeProvider>{children}</ThemeProvider>
    );

    if (!clientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google OAuth will not be available.");
      return content;
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {content}
        </GoogleOAuthProvider>
    );
}