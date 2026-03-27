"use client";

import { useState, useEffect } from "react";
import { contentService } from "@/services/di";
import { IContentSettings, IEmailDisplay } from "@/types/settings-content.types";

export default function ContentSettings() {
  const [settings, setSettings] = useState<IContentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await contentService.getSettings();
      //console.error("Loaded content settings:", data); // check
      setSettings(data);
    } catch (error) {
      console.error("Failed to load content settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = async (key: keyof IContentSettings, value: string | boolean) => {
    if (!settings) return;
    //console.error(`Updating ${key} to:`, value); // check

    const previousSettings = { ...settings };
    setSettings({ ...settings, [key]: value });

    try {
      await contentService.updateSettings({ [key]: value });
    } catch (error) {
      setSettings(previousSettings);
      console.error("Failed to update content settings:", error);
    }
  };

  const inputStyle = {
    backgroundColor: "#2a2a2a",
    border: "1px solid #444",
    borderRadius: "4px",
    color: "#fff",
    padding: "10px 12px",
    width: "100%",
    fontSize: "14px",
  };

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
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

      {/* RSS Feed */}
      <div style={{ marginBottom: "48px" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          RSS feed
          <span style={{
            width: "16px", height: "16px", borderRadius: "50%",
            background: "#555", display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "11px", cursor: "pointer"
          }}>i</span>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <div>
            <label style={{ display: "block", color: "#aaa", marginBottom: "8px", fontSize: "14px" }}>RSS feed</label>
            <input style={inputStyle} value={settings.rssUrl} readOnly />
          </div>
          <div>
            <label style={{ display: "block", color: "#aaa", marginBottom: "8px", fontSize: "14px" }}>Email address displayed</label>
            <select
              style={selectStyle}
              value={settings.emailDisplay}
              onChange={(e) => handleChange("emailDisplay", e.target.value as IEmailDisplay)}
            >
              <option value="don&apos;t display">Don&apos;t display email address</option>
              <option value="display">Display email address</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <div>
            <label style={{ display: "block", color: "#aaa", marginBottom: "8px", fontSize: "14px" }}>Custom feed title</label>
            <input
              style={inputStyle}
              value={settings.customFeedTitle}
              onChange={(e) => handleChange("customFeedTitle", e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#aaa", marginBottom: "8px", fontSize: "14px" }}>
              Category <span style={{ color: "red" }}>*</span>
            </label>
            <select
              style={selectStyle}
              value={settings.category}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              <option value=""></option>
              <option>Music</option>
              <option>Technology</option>
              <option>Education</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", color: "#aaa", marginBottom: "8px", fontSize: "14px" }}>
              Stats-service URL prefix
              <span style={{
                marginLeft: "6px", width: "16px", height: "16px", borderRadius: "50%",
                background: "#555", display: "inline-flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "11px", cursor: "pointer"
              }}>i</span>
            </label>
            <input
              style={inputStyle}
              placeholder="http://"
              value={settings.statsServiceUrl}
              onChange={(e) => handleChange("statsServiceUrl", e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <div>
            <label style={{ display: "block", color: "#aaa", marginBottom: "8px", fontSize: "14px" }}>Custom author name</label>
            <input
              style={inputStyle}
              value={settings.customAuthorName}
              onChange={(e) => handleChange("customAuthorName", e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#aaa", marginBottom: "8px", fontSize: "14px" }}>
              Language <span style={{ color: "red" }}>*</span>
            </label>
            <select
              style={selectStyle}
              value={settings.language}
              onChange={(e) => handleChange("language", e.target.value)}
            >
              <option>English</option>
              <option>Arabic</option>
              <option>French</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", color: "#aaa", marginBottom: "8px", fontSize: "14px" }}>
              Subscriber redirect
              <span style={{
                marginLeft: "6px", width: "16px", height: "16px", borderRadius: "50%",
                background: "#555", display: "inline-flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "11px", cursor: "pointer"
              }}>i</span>
            </label>
            <input
              style={inputStyle}
              placeholder="http://"
              value={settings.subscriberRedirect}
              onChange={(e) => handleChange("subscriberRedirect", e.target.value)}
            />
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={settings.explicitContent}
            onChange={(e) => handleChange("explicitContent", e.target.checked)}
            style={{ width: "18px", height: "18px" }}
          />
          <span style={{ fontSize: "14px" }}>Contains explicit content</span>
        </label>
      </div>

      {/* Upload Defaults */}
      <div>
        <h2 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          Upload Defaults
          <span style={{
            width: "16px", height: "16px", borderRadius: "50%",
            background: "#555", display: "inline-flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "11px", cursor: "pointer"
          }}>i</span>
        </h2>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", marginBottom: "16px" }}>
          <input
            type="checkbox"
            checked={settings.includeInRSS}
            onChange={(e) => handleChange("includeInRSS", e.target.checked)}
            style={{ width: "18px", height: "18px" }}
          />
          <span style={{ fontSize: "14px" }}>Include in RSS feed</span>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={settings.creativeCommons}
            onChange={(e) => handleChange("creativeCommons", e.target.checked)}
            style={{ width: "18px", height: "18px" }}
          />
          <span style={{ fontSize: "14px" }}>Creative Commons license</span>
        </label>
      </div>

    </div>
  );
}