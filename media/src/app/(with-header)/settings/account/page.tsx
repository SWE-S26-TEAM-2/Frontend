"use client";

import { useState, useEffect } from "react";
import { accountService } from "@/services/di";
import { IAccountSettings, ITheme } from "@/types/settings-account.types";
import { useTheme } from "@/hooks/useTheme";

export default function AccountSettings() {
  const [settings, setSettings] = useState<IAccountSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setTheme } = useTheme();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await accountService.getSettings();
      //console.error("Loaded account settings:", data);  // check
      setSettings(data);
    } catch (error) {
      console.error("Failed to load account settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (theme: ITheme) => {
    if (!settings) return;

    const previousSettings = { ...settings };
    setSettings({ ...settings, theme });
    setTheme(theme); // apply to DOM immediately

    try {
      await accountService.updateSettings({ theme });
    } catch (error) {
      setSettings(previousSettings);
      setTheme(previousSettings.theme); // revert DOM on failure
      console.error("Failed to update theme:", error);
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

      {/* Change theme */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ marginBottom: "20px" }}>Change theme</h2>
        {(["light", "dark", "automatic"] as ITheme[]).map((option) => (
          <label
            key={option}
            style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", cursor: "pointer" }}
          >
            <input
              type="radio"
              name="theme"
              value={option}
              checked={settings.theme === option}
              onChange={() => handleThemeChange(option)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <span style={{ textTransform: "capitalize" }}>{option}</span>
          </label>
        ))}
      </div>

      {/* Email addresses */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ marginBottom: "16px" }}>Email addresses</h2>
        {settings.emails.map((email) => (
          <p key={email.address} style={{ marginBottom: "16px" }}>
            {email.address}{" "}
            {email.isPrimary && <span style={{ color: "#aaa" }}>(Primary)</span>}
          </p>
        ))}
        <button
          style={{
            padding: "10px 18px",
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Add an email address
        </button>
      </div>

      {/* Sign in with social networks */}
      <div>
        <h2 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          Sign in with other social networks
          <span style={{
            width: "16px", height: "16px", borderRadius: "50%",
            background: "#555", display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "11px", cursor: "pointer"
          }}>i</span>
        </h2>
        {!settings.linkedAccounts.facebook && !settings.linkedAccounts.google && !settings.linkedAccounts.apple && (
          <p style={{ color: "#aaa", marginBottom: "20px" }}>
            You have not linked social accounts to your SoundCloud account.
          </p>
        )}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {!settings.linkedAccounts.facebook && (
            <button style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 18px", background: "#1877F2",
              color: "#fff", border: "none", borderRadius: "6px",
              cursor: "pointer", fontSize: "14px",
            }}>
              <span>f</span> Add Facebook account
            </button>
          )}
          {!settings.linkedAccounts.google && (
            <button style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 18px", background: "#fff",
              color: "#000", border: "1px solid #ddd", borderRadius: "6px",
              cursor: "pointer", fontSize: "14px",
            }}>
              <span>G</span> Add Google account
            </button>
          )}
          {!settings.linkedAccounts.apple && (
            <button style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 18px", background: "#000",
              color: "#fff", border: "1px solid #555", borderRadius: "6px",
              cursor: "pointer", fontSize: "14px",
            }}>
              <span></span> Add Apple account
            </button>
          )}
        </div>
      </div>

    </div>
  );
}