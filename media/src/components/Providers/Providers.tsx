"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ThemeProvider from "@/components/Providers/ThemeProvider";
import GlobalPlayer from "@/components/GlobalPlayer/GlobalPlayer";

export default function Providers({ children }: { children: React.ReactNode }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

    const content = (
        <ThemeProvider>
            {children}
            <GlobalPlayer />
        </ThemeProvider>
    );

    if (!clientId || useMock) {
      return content;
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {content}
        </GoogleOAuthProvider>
    );
}