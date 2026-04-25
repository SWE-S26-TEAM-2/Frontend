"use client";
// advertising page
import { useState, useEffect } from "react";
import { advertisingService } from "@/services/di";
import { IAdvertisingSettings } from "@/types/settings-advertising.types";
import SettingsFooter from "@/components/SettingsFooter/SettingsFooter";

export default function AdvertisingSettings() {
  const [settings, setSettings] = useState<IAdvertisingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await advertisingService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to load advertising settings:", error);
    } finally {
      setIsLoading(false);
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
        <h2 className="text-base font-semibold mb-4">Advertising Settings</h2>
        <p className="text-[#aaa] text-sm max-w-xl leading-relaxed mb-6">
          We work with trusted advertising partners to show you content and advertisements
          for products and services you might like. Understand how your data may be used,
          who our partners are and manage your consent options.
        </p>

        <a href={settings.partnersListUrl}>
          <button className="px-4 py-2 bg-[#333] hover:bg-[#444] text-white text-sm font-bold rounded border-none cursor-pointer transition-colors">
            Partners List
          </button>
        </a>
      </div>

      <SettingsFooter />
    </div>
  );
}