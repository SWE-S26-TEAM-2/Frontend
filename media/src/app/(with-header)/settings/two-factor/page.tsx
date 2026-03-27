"use client";

import { useState, useEffect } from "react";
import { twoFactorService } from "@/services/di";
import { ITwoFactorSettings } from "@/types/settings-two-factor.types";

export default function TwoFactorSettings() {
  const [settings, setSettings] = useState<ITwoFactorSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await twoFactorService.getSettings();
      // console.error("Loaded 2FA settings:", data); // check
      setSettings(data);
    } catch (error) {
      console.error("Failed to load 2FA settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable = async () => {
    if (!settings) return;
    //console.error("Toggling 2FA to:", !settings.isEnabled); // check

    const previousSettings = { ...settings };
    setSettings({ ...settings, isEnabled: !settings.isEnabled });

    try {
      await twoFactorService.updateSettings({ isEnabled: !settings.isEnabled });
    } catch (error) {
      setSettings(previousSettings);
      console.error("Failed to update 2FA settings:", error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ color: "#fff", padding: "40px" }}>
        Loading...
      </div>
    );
  }

  if (!settings) {
    return (
      <div style={{ color: "#fff", padding: "40px" }}>
        Failed to load settings
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", color: "#fff" }}>
      <h3 style={{ color: "#aaa", fontWeight: "normal", marginBottom: "24px" }}>Status</h3>

      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <span style={{ fontSize: "64px" }}>🔒</span>
          {!settings.isEnabled && (
            <span style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              fontSize: "24px"
            }}>⚠️</span>
          )}
        </div>

        <div>
          <h2 style={{ marginBottom: "12px" }}>
            {settings.isEnabled ? "Two-Factor Authentication is enabled" : "Protect your account"}
          </h2>
          <p style={{ color: "#aaa", maxWidth: "600px", lineHeight: "1.6" }}>
            Protect your privacy and secure your SoundCloud account with Two-Factor
            Authentication (2FA). When enabled, you&apos;ll need a 6-digit code from an
            authenticator app each time you log in, adding an extra layer of security.{" "}
            <a href="#" style={{ color: "#0066cc" }}>Learn more</a>
          </p>
        </div>
      </div>

      <button
        onClick={handleEnable}
        style={{
          marginTop: "32px",
          padding: "12px 24px",
          borderRadius: "24px",
          border: "1px solid #fff",
          background: settings.isEnabled ? "#ff5500" : "transparent",
          color: "#fff",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        {settings.isEnabled ? "Disable Two-Factor Auth (2FA)" : "Enable Two-Factor Auth (2FA)"}
      </button>
    </div>
  );
}