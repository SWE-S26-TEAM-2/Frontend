"use client";
// notifications page
import { useState, useEffect } from "react";
import { notificationService } from "@/services/di";
import { INotificationSettings, INotificationRow, IDevicesValue } from "@/types/settings-notification.types";
import SettingsFooter from "@/components/Settings/SettingsFooter";

const DEVICES_DROPDOWN_OPTIONS: Array<"Everyone" | "Followed" | "Off"> = ["Everyone", "Followed", "Off"];

export default function NotificationsSettings() {
  const [settings, setSettings] = useState<INotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await notificationService.getSettings();
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
    value: IDevicesValue
  ) => {
    if (!settings) return;
    const previousSettings = { ...settings };
    const updatedActivities = settings.activities.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setSettings({ ...settings, activities: updatedActivities });
    try {
      await notificationService.updateSettings({ activities: updatedActivities });
    } catch (error) {
      setSettings(previousSettings);
      console.error("Failed to update notification settings:", error);
    }
  };

  const handleUpdateChange = async (
    index: number,
    field: "email" | "devices",
    value: IDevicesValue
  ) => {
    if (!settings) return;
    const previousSettings = { ...settings };
    const updatedSoundcloudUpdates = settings.soundcloudUpdates.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setSettings({ ...settings, soundcloudUpdates: updatedSoundcloudUpdates });
    try {
      await notificationService.updateSettings({ soundcloudUpdates: updatedSoundcloudUpdates });
    } catch (error) {
      setSettings(previousSettings);
      console.error("Failed to update notification settings:", error);
    }
  };

  const renderEmailCell = (value: boolean, onChange: (value: boolean) => void) => (
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
      className="w-[18px] h-[18px] cursor-pointer accent-[#ff5500]"
    />
  );

  const renderDevicesCell = (row: INotificationRow, onChange: (value: IDevicesValue) => void) => {
    if (row.devices === "none") {
      return null;
    }

    if (row.name === "New message") {
      return (
        <select
          value={row.devices as string}
          onChange={(e) => onChange(e.target.value as IDevicesValue)}
          className="bg-[#222] text-white border border-[#555] rounded px-2 py-1 text-sm cursor-pointer focus:outline-none"
        >
          {DEVICES_DROPDOWN_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="checkbox"
        checked={row.devices as boolean}
        onChange={(e) => onChange(e.target.checked)}
        className="w-[18px] h-[18px] cursor-pointer accent-[#ff5500]"
      />
    );
  };

  const renderSection = (
    title: string,
    rows: INotificationRow[],
    onEmailChange: (index: number, value: boolean) => void,
    onDevicesChange: (index: number, value: IDevicesValue) => void
  ) => (
    <div className="mb-12">
      <div className="grid grid-cols-[1fr_120px_120px] gap-4 mb-4 items-center">
        <span className="text-sm font-bold">{title}</span>
        <span className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" defaultChecked className="w-[18px] h-[18px] accent-[#ff5500]" />
          Email
        </span>
        <span className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" defaultChecked className="w-[18px] h-[18px] accent-[#ff5500]" />
          Devices
        </span>
      </div>

      {rows.map((row, index) => (
        <div
          key={row.name}
          className="grid grid-cols-[1fr_120px_120px] items-center py-3 border-t border-[#222]"
        >
          <span className="text-white font-bold text-sm">{row.name}</span>
          <span>
            {renderEmailCell(row.email, (value) => onEmailChange(index, value))}
          </span>
          <span>
            {renderDevicesCell(row, (value) => onDevicesChange(index, value))}
          </span>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return <div className="py-10 text-white">Loading...</div>;
  }

  if (!settings) {
    return <div className="py-10 text-white">Failed to load settings</div>;
  }

  return (
    <div className="text-white pb-24">
      <div className="py-8 max-w-5xl">
        {renderSection(
          "Activities",
          settings.activities,
          (index, value) => void handleActivityChange(index, "email", value),
          (index, value) => void handleActivityChange(index, "devices", value)
        )}
        {renderSection(
          "Updates from SoundCloud",
          settings.soundcloudUpdates,
          (index, value) => void handleUpdateChange(index, "email", value),
          (index, value) => void handleUpdateChange(index, "devices", value)
        )}
      </div>
      <SettingsFooter />
    </div>
  );
}