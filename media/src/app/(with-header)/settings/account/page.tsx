"use client";

import { useState, useEffect } from "react";
import { accountService } from "@/services/di";
import { IAccountSettings, ITheme } from "@/types/settings-account.types";
import { useTheme } from "@/hooks/useTheme";

export default function AccountSettings() {
  const [settings,  setSettings]  = useState<IAccountSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setTheme } = useTheme();

  useEffect(() => { void loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      setSettings(await accountService.getSettings());
    } catch (error) {
      console.error("Failed to load account settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (theme: ITheme) => {
    if (!settings) return;
    const previous = { ...settings };
    setSettings({ ...settings, theme });
    setTheme(theme);
    try {
      await accountService.updateSettings({ theme });
    } catch (error) {
      setSettings(previous);
      setTheme(previous.theme);
      console.error("Failed to update theme:", error);
    }
  };

  if (isLoading) return <div className="p-10 text-white">Loading…</div>;
  if (!settings)  return <div className="p-10 text-white">Failed to load settings</div>;

  return (
    <div className="p-10 text-white">

      {/* ── Change theme ── */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-5">Change theme</h2>
        <div className="flex flex-col gap-3">
          {(["light", "dark", "automatic"] as ITheme[]).map((option) => (
            <label key={option} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value={option}
                checked={settings.theme === option}
                onChange={() => void handleThemeChange(option)}
                className="w-[18px] h-[18px] accent-[#ff5500] cursor-pointer"
              />
              <span className="capitalize text-sm">{option}</span>
            </label>
          ))}
        </div>
      </section>

      {/* ── Email addresses ── */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Email addresses</h2>
        <div className="flex flex-col gap-4 mb-4">
          {settings.emails.map((email) => (
            <p key={email.address} className="text-sm">
              {email.address}{" "}
              {email.isPrimary && <span className="text-[#aaa]">(Primary)</span>}
            </p>
          ))}
        </div>
        <button className="px-4 py-2.5 bg-[#333] hover:bg-[#444] text-white text-sm rounded-md border-none cursor-pointer transition-colors">
          Add an email address
        </button>
      </section>

      {/* ── Social logins ── */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
          Sign in with other social networks
          <span className="w-4 h-4 rounded-full bg-[#555] inline-flex items-center justify-center text-[11px] cursor-pointer">
            i
          </span>
        </h2>

        {!settings.linkedAccounts.facebook && !settings.linkedAccounts.google && !settings.linkedAccounts.apple && (
          <p className="text-[#aaa] text-sm mb-5">
            You have not linked social accounts to your SoundCloud account.
          </p>
        )}

        <div className="flex gap-3 flex-wrap">
          {!settings.linkedAccounts.facebook && (
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm rounded-md border-none cursor-pointer transition-colors">
              <span className="font-bold">f</span> Add Facebook account
            </button>
          )}
          {!settings.linkedAccounts.google && (
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-100 text-black text-sm rounded-md border border-[#ddd] cursor-pointer transition-colors">
              <span className="font-bold">G</span> Add Google account
            </button>
          )}
          {!settings.linkedAccounts.apple && (
            <button className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-[#111] text-white text-sm rounded-md border border-[#555] cursor-pointer transition-colors">
              <span></span> Add Apple account
            </button>
          )}
        </div>
      </section>

    </div>
  );
}
