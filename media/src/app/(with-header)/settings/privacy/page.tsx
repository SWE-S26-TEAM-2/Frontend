"use client";
// privacy page
import { useState, useEffect } from "react";
import { privacyService } from "@/services/di";
import { IPrivacySettings, IBlockedUser } from "@/types/settings-privacy.types";
import BlockedUserCard from "@/components/Settings/BlockedUserCard";
import SettingsFooter from "@/components/Settings/SettingsFooter";

interface IPrivacyToggleRowProps {
  title: string;
  description: string;
  isEnabled: boolean;
  onToggle: (value: boolean) => void;
}

function PrivacyToggleRow({ title, description, isEnabled, onToggle }: IPrivacyToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-8 py-5 border-b border-[#1e1e1e]">
      <div className="flex-1">
        <p className="text-white text-sm font-medium mb-1">{title}</p>
        <p className="text-[#999] text-xs leading-relaxed">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={isEnabled}
        onClick={() => onToggle(!isEnabled)}
        className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer border-none outline-none ${
          isEnabled ? "bg-[#ff5500]" : "bg-[#444]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            isEnabled ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function PrivacySettings() {
  const [settings, setSettings] = useState<IPrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await privacyService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (key: keyof IPrivacySettings, value: boolean) => {
    if (!settings) return;
    const previousSettings = { ...settings };
    setSettings({ ...settings, [key]: value });
    try {
      await privacyService.updateSettings({ [key]: value });
    } catch (error) {
      setSettings(previousSettings);
      console.error("Failed to update:", error);
    }
  };

  const handleUnblock = async (userId: string) => {
    if (!settings) return;
    const previousSettings = { ...settings };
    const updatedBlockedUsers = settings.blockedUsers.filter((u) => u.id !== userId);
    setSettings({ ...settings, blockedUsers: updatedBlockedUsers });
    try {
      await privacyService.updateSettings({ blockedUsers: updatedBlockedUsers });
    } catch (error) {
      setSettings(previousSettings);
      console.error("Failed to unblock user:", error);
    }
  };

  if (isLoading) {
    return <div className="py-10 text-white">Loading...</div>;
  }

  if (!settings) {
    return <div className="py-10 text-white">Failed to load settings</div>;
  }

  return (
    <div className="text-white pb-24">
      <div className="py-8 max-w-5xl">
        <h1 className="text-xl font-bold mb-6">Privacy settings</h1>

        <div className="mb-12">
          <PrivacyToggleRow
            title="Receive messages from anyone"
            description="For your safety, we recommend only allowing messages from people you follow. Turning this on will allow anyone to send you messages."
            isEnabled={settings.receiveMessages}
            onToggle={(value) => void handleToggle("receiveMessages", value)}
          />
          <PrivacyToggleRow
            title="Show my activities in social discovery playlists and modules"
            description="Your Likes, Reactions and other engagement may be shown to other users in discovery features such as 'Liked By' playlists or update feeds. Turning this off won't hide your Likes on your profile or tracks."
            isEnabled={settings.showActivities}
            onToggle={(value) => void handleToggle("showActivities", value)}
          />
          <PrivacyToggleRow
            title="Show when I'm a First or Top Fan"
            description="Appear in public Top Fans and First Fans lists."
            isEnabled={settings.showTopFan}
            onToggle={(value) => void handleToggle("showTopFan", value)}
          />
          <PrivacyToggleRow
            title="Show First and Top Fans for my tracks"
            description="Your First and Top Fans will appear on your tracks."
            isEnabled={settings.showTrackFans}
            onToggle={(value) => void handleToggle("showTrackFans", value)}
          />
        </div>

        <h2 className="text-base font-semibold mb-4">Blocked users</h2>
        {settings.blockedUsers.length > 0 ? (
          <div className="mb-8 flex flex-col">
            {settings.blockedUsers.map((user) => (
              <BlockedUserCard
                key={user.id}
                user={user}
                onUnblock={handleUnblock}
              />
            ))}
          </div>
        ) : (
          <p className="text-[#aaa] text-sm mb-8">You have not blocked any users.</p>
        )}
      </div>

      <SettingsFooter />
    </div>
  );
}