"use client";
// content page
import { useState, useEffect, useRef } from "react";
import { contentService } from "@/services/di";
import { IContentSettings, IEmailDisplay } from "@/types/settings-content.types";
import SettingsFooter from "@/components/Settings/SettingsFooter";

const CATEGORIES = [
  "Arts", "Business", "Comedy", "Education", "Fiction", "Government",
  "Health & Fitness", "History", "Kids & Family", "Leisure", "Music",
  "News", "Religion & Spirituality", "Science", "Society & Culture",
  "Sports", "Technology", "True Crime", "TV & Film",
];

const LANGUAGES = [
  "Afrikaans", "Albanian", "Arabic", "Belarusian", "Bulgarian", "Catalan",
  "Chinese (Simplified)", "Chinese (Traditional)", "Croatian", "Czech",
  "Danish", "Dutch", "English", "Estonian", "Faeroese", "Finnish", "French",
  "Gaelic", "Galician", "German", "Greek", "Hawaiian", "Hebrew", "Hindi",
  "Hungarian", "Icelandic", "Indonesian", "Irish", "Italian", "Japanese",
  "Korean", "Lithuanian", "Macedonian", "Maori", "Mongolian", "Norwegian",
  "Polish", "Portuguese", "Punjabi", "Romanian", "Russian", "Serbian",
  "Slovak", "Slovenian", "Spanish", "Swedish", "Thai", "Turkish", "Ukranian",
];

export default function ContentSettings() {
  const [settings, setSettings] = useState<IContentSettings | null>(null);
  const [draft, setDraft] = useState<IContentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadSettings();
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const data = await contentService.getSettings();
      setSettings(data);
      setDraft({ ...data });
    } catch (error) {
      console.error("Failed to load content settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraftChange = (key: keyof IContentSettings, value: string | boolean) => {
    if (!draft) return;
    setDraft({ ...draft, [key]: value });
  };

  const handleSave = async () => {
    if (!draft) return;
    try {
      await contentService.updateSettings(draft);
      setSettings({ ...draft });
      setShowToast(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setShowToast(false), 4000);
    } catch (error) {
      console.error("Failed to save content settings:", error);
    }
  };

  const handleCancel = () => {
    if (settings) setDraft({ ...settings });
  };

  const inputStyle =
    "bg-[#2a2a2a] border border-[#444] rounded text-white px-3 py-2 w-full text-sm focus:outline-none focus:border-[#666]";
  const selectStyle =
    "bg-[#2a2a2a] border border-[#444] rounded text-white px-3 py-2 w-full text-sm cursor-pointer focus:outline-none focus:border-[#666]";

  const InfoIcon = () => (
    <span className="w-4 h-4 rounded-full bg-[#555] inline-flex items-center justify-center text-[11px] cursor-pointer flex-shrink-0">
      i
    </span>
  );

  if (isLoading) return <div className="py-10 text-white">Loading...</div>;
  if (!draft) return <div className="py-10 text-white">Failed to load settings</div>;

  return (
    <div className="text-white pb-24 relative">

      {/* ── Centered toast overlay ── */}
      {showToast && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg px-6 py-3 shadow-2xl pointer-events-auto">
            <p className="text-white text-sm">Your settings have been updated successfully.</p>
          </div>
        </div>
      )}

      <div className="py-8 max-w-5xl">

        {/* ── RSS Feed ── */}
        <section className="mb-12">
          <h2 className="flex items-center gap-2 text-base font-semibold mb-6">
            RSS feed <InfoIcon />
          </h2>

          {/* Row 1: RSS URL + Email display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[#aaa] text-xs mb-2">RSS feed</label>
              <input
                className={inputStyle}
                value={draft.rssUrl}
                readOnly
              />
            </div>
            <div>
              <label className="block text-[#aaa] text-xs mb-2">Email address displayed</label>
              <select
                className={selectStyle}
                value={draft.emailDisplay}
                onChange={(e) => handleDraftChange("emailDisplay", e.target.value as IEmailDisplay)}
              >
                <option value="don't display">Don&apos;t display email address</option>
                <option value="display">Display email address</option>
              </select>
            </div>
          </div>

          {/* Row 2: Custom feed title + Category + Stats URL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-[#aaa] text-xs mb-2">Custom feed title</label>
              <input
                className={inputStyle}
                value={draft.customFeedTitle}
                onChange={(e) => handleDraftChange("customFeedTitle", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[#aaa] text-xs mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className={selectStyle}
                value={draft.category}
                onChange={(e) => handleDraftChange("category", e.target.value)}
              >
                <option value=""></option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1 text-[#aaa] text-xs mb-2">
                Stats-service URL prefix <InfoIcon />
              </label>
              <input
                className={inputStyle}
                placeholder="http://"
                value={draft.statsServiceUrl}
                onChange={(e) => handleDraftChange("statsServiceUrl", e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: Custom author + Language + Subscriber redirect */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-[#aaa] text-xs mb-2">Custom author name</label>
              <input
                className={inputStyle}
                value={draft.customAuthorName}
                onChange={(e) => handleDraftChange("customAuthorName", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[#aaa] text-xs mb-2">
                Language <span className="text-red-500">*</span>
              </label>
              <select
                className={selectStyle}
                value={draft.language}
                onChange={(e) => handleDraftChange("language", e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1 text-[#aaa] text-xs mb-2">
                Subscriber redirect <InfoIcon />
              </label>
              <input
                className={inputStyle}
                placeholder="http://"
                value={draft.subscriberRedirect}
                onChange={(e) => handleDraftChange("subscriberRedirect", e.target.value)}
              />
            </div>
          </div>

          {/* Explicit content checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.explicitContent}
              onChange={(e) => handleDraftChange("explicitContent", e.target.checked)}
              className="w-[18px] h-[18px] cursor-pointer accent-[#ff5500]"
            />
            <span className="text-sm font-medium">Contains explicit content</span>
          </label>
        </section>

        {/* ── Upload Defaults ── */}
        <section className="mb-12">
          <h2 className="flex items-center gap-2 text-base font-semibold mb-6">
            Upload Defaults <InfoIcon />
          </h2>

          <label className="flex items-center gap-2.5 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={draft.includeInRSS}
              onChange={(e) => handleDraftChange("includeInRSS", e.target.checked)}
              className="w-[18px] h-[18px] cursor-pointer accent-[#ff5500]"
            />
            <span className="text-sm">Include in RSS feed</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.creativeCommons}
              onChange={(e) => handleDraftChange("creativeCommons", e.target.checked)}
              className="w-[18px] h-[18px] cursor-pointer accent-[#ff5500]"
            />
            <span className="text-sm">Creative Commons license</span>
          </label>
        </section>

        {/* ── Cancel / Save buttons ── */}
        <div className="flex justify-end items-center gap-6 mb-8">
          <button
            onClick={handleCancel}
            className="text-white text-sm cursor-pointer bg-transparent border-none hover:text-[#aaa] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSave()}
            className="px-5 py-2 bg-[#555] hover:bg-[#666] text-white text-sm rounded border-none cursor-pointer transition-colors"
          >
            Save changes
          </button>
        </div>

      </div>

      <SettingsFooter />
    </div>
  );
}