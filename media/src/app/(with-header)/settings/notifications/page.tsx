"use client";

import { useState, useEffect } from "react";
import { getNotificationSettings, updateNotificationSettings } from "@/services/settings-notification.service";
import { INotificationSettings, INotificationRow, DevicesValue } from "@/types/settings-notification.types";

export default function NotificationsSettings() {
  const [settings, setSettings] = useState<INotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getNotificationSettings();
      console.log("Loaded notification settings:", data); // check
      setSettings(data);
    } catch (error) {
      console.error("Failed to load notification settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityChange = async (
    index: number,
    field: "email" | "devices",
    value: DevicesValue
  ) => {
    if (!settings) return;
    console.log(`Updating activity ${index} ${field} to:`, value); // check

    const previousSettings = { ...settings };
    const updatedActivities = settings.activities.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setSettings({ ...settings, activities: updatedActivities });

    try {
      await updateNotificationSettings({ activities: updatedActivities });
    } catch (error) {
      setSettings(previousSettings);
      console.error("Failed to update notification settings:", error);
    }
  };

  const handleUpdateChange = async (
    index: number,
    field: "email" | "devices",
    value: DevicesValue
  ) => {
    if (!settings) return;
    console.log(`Updating soundcloudUpdate ${index} ${field} to:`, value); // check

    const previousSettings = { ...settings };
    const updatedSoundcloudUpdates = settings.soundcloudUpdates.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setSettings({ ...settings, soundcloudUpdates: updatedSoundcloudUpdates });

    try {
      await updateNotificationSettings({ soundcloudUpdates: updatedSoundcloudUpdates });
    } catch (error) {
      setSettings(previousSettings);
      console.error("Failed to update notification settings:", error);
    }
  };

  const renderCheckbox = (
    value: DevicesValue,
    onChange: (value: DevicesValue) => void
  ) => {
    if (typeof value === "string") {
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as DevicesValue)}
          style={{
            background: "#222",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "4px",
            padding: "4px 8px",
          }}
        >
          <option>Everyone</option>
          <option>Following</option>
          <option>No one</option>
        </select>
      );
    }
    return (
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: "18px", height: "18px", cursor: "pointer" }}
      />
    );
  };

  const renderSection = (
    title: string,
    rows: INotificationRow[],
    onEmailChange: (index: number, value: DevicesValue) => void,
    onDevicesChange: (index: number, value: DevicesValue) => void
  ) => (
    <div style={{ marginBottom: "48px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 120px",
          alignItems: "center",
          marginBottom: "16px",
          fontWeight: "bold",
        }}
      >
        <span>{title}</span>
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px" }} />
          Email
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px" }} />
          Devices
        </span>
      </div>

      {rows.map((row, index) => (
        <div
          key={row.name}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 120px",
            alignItems: "center",
            padding: "12px 0",
            borderTop: "1px solid #222",
          }}
        >
          <span style={{ color: "#fff", fontWeight: "bold", fontSize: "14px" }}>{row.name}</span>
          <span>{renderCheckbox(row.email, (value) => onEmailChange(index, value))}</span>
          <span>{renderCheckbox(row.devices, (value) => onDevicesChange(index, value))}</span>
        </div>
      ))}
    </div>
  );

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
      {renderSection(
        "Activities",
        settings.activities,
        (index, value) => handleActivityChange(index, "email", value),
        (index, value) => handleActivityChange(index, "devices", value)
      )}
      {renderSection(
        "Updates from SoundCloud",
        settings.soundcloudUpdates,
        (index, value) => handleUpdateChange(index, "email", value),
        (index, value) => handleUpdateChange(index, "devices", value)
      )}
    </div>
  );
}