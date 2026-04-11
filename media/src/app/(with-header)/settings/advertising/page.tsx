"use client";

import { useState, useEffect } from "react";
import { advertisingService } from "@/services/di";
import { IAdvertisingSettings } from "@/types/settings-advertising.types";

export default function AdvertisingSettings() {
  const [settings, setSettings] = useState<IAdvertisingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await advertisingService.getSettings();
      //console.error("Loaded advertising settings:", data); // check
      setSettings(data);
    } catch (error) {
      console.error("Failed to load advertising settings:", error);
    } finally {
      setIsLoading(false);
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
      <h2 style={{ marginBottom: "16px" }}>Advertising Settings</h2>
      <p style={{ color: "#aaa", maxWidth: "600px", lineHeight: "1.6", marginBottom: "24px" }}>
        We work with trusted advertising partners to show you content and
        advertisements for products and services you might like. Understand how
        your data may be used, who our partners are and manage your consent options.
      </p>

      <a href={settings.partnersListUrl}>
        <button
          style={{
            padding: "10px 18px",
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Partners List
        </button>
      </a>

      <div style={{ marginTop: "200px", color: "#aaa", fontSize: "13px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {["Legal", "Privacy", "Cookie Policy", "Cookie Manager", "Imprint", "Artist Resources", "Newsroom", "Charts", "Transparency Reports"].map((link, index, arr) => (
            <span key={link}>
              <a href="#" style={{ color: "#aaa", textDecoration: "none" }}>{link}</a>
              {index < arr.length - 1 && <span style={{ marginLeft: "8px" }}>·</span>}
            </span>
          ))}
        </div>
        <p>Language: <a href="#" style={{ color: "#0066cc" }}>{settings.language}</a></p>
      </div>
    </div>
  );
}