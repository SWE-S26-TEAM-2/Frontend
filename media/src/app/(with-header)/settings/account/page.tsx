"use client";
// account page
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { accountService } from "@/services/di";
import { IAccountSettings, ITheme, IGender } from "@/types/settings-account.types";
import { useTheme } from "@/hooks/useTheme";
import SettingsFooter from "@/components/Settings/SettingsFooter";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
const GENDERS: IGender[] = ["Female", "Male", "Non-binary", "Prefer not to say"];

const DELETE_REASONS = [
  "I have another account",
  "I want to make a new account",
  "There aren't enough privacy options",
  "I am no longer creating content for this account",
  "I had copyright issues with a track or tracks",
  "I don't want to subscribe to SoundCloud Pro anymore",
  "I switched to another music or audio service",
  "My account got hacked",
  "I can't remove my tracks",
  "People are harassing me",
  "Too much spam on the platform",
  "Other, please specify",
];

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export default function AccountSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<IAccountSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setTheme } = useTheme();

  // Email
  const [showAddEmail, setShowAddEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Password reset
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReasons, setDeleteReasons] = useState<string[]>([]);
  const [deleteOther, setDeleteOther] = useState("");
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    } catch {
      setSettings(previous);
      setTheme(previous.theme);
    }
  };

  const handleBirthDateChange = async (field: "month" | "day" | "year", value: string | number) => {
    if (!settings) return;
    const previous = { ...settings };
    const updated = { ...settings, birthDate: { ...settings.birthDate, [field]: value } };
    setSettings(updated);
    try {
      await accountService.updateSettings({ birthDate: updated.birthDate });
    } catch {
      setSettings(previous);
    }
  };

  const handleGenderChange = async (gender: IGender) => {
    if (!settings) return;
    const previous = { ...settings };
    setSettings({ ...settings, gender });
    try {
      await accountService.updateSettings({ gender });
    } catch {
      setSettings(previous);
    }
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) {
      setEmailError("Please enter an email address.");
      return;
    }
    if (!isValidEmail(newEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (settings?.emails.some((e) => e.address === newEmail.trim())) {
      setEmailError("This email address is already added.");
      return;
    }
    setEmailError("");
    if (settings) {
      setSettings({
        ...settings,
        emails: [...settings.emails, { address: newEmail.trim(), isPrimary: false }],
      });
    }
    setNewEmail("");
    setShowAddEmail(false);
  };

  const handleDisconnect = async (platform: "facebook" | "google") => {
    if (!settings) return;
    const previous = { ...settings };
    const updatedInfo = settings.linkedAccountsInfo.filter((a) => a.platform !== platform);
    const updated = {
      ...settings,
      linkedAccounts: { ...settings.linkedAccounts, [platform]: false },
      linkedAccountsInfo: updatedInfo,
    };
    setSettings(updated);
    try {
      await accountService.updateSettings({
        linkedAccounts: updated.linkedAccounts,
        linkedAccountsInfo: updatedInfo,
      });
    } catch {
      setSettings(previous);
    }
  };

  const handleRevokeApp = async (appId: string) => {
    if (!settings) return;
    const previous = { ...settings };
    const updated = settings.connectedApps.filter((a) => a.id !== appId);
    setSettings({ ...settings, connectedApps: updated });
    try {
      await accountService.updateSettings({ connectedApps: updated });
    } catch {
      setSettings(previous);
    }
  };

  const handleRevokeAll = async () => {
    if (!settings) return;
    const previous = { ...settings };
    setSettings({ ...settings, connectedApps: [] });
    try {
      await accountService.updateSettings({ connectedApps: [] });
    } catch {
      setSettings(previous);
    }
  };

  const handlePasswordReset = async () => {
    if (!settings) return;
    setIsResettingPassword(true);
    try {
      await accountService.sendPasswordResetEmail(settings.primaryEmail);
      setPasswordResetSent(true);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const toggleDeleteReason = (reason: string) => {
    setDeleteReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmed) return;
    setIsDeleting(true);
    try {
      // In real app: await accountService.deleteAccount();
      localStorage.removeItem("auth_token");
      router.push("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      setIsDeleting(false);
    }
  };

  const inputStyle =
    "bg-[#2a2a2a] border border-[#444] rounded text-white px-3 py-2 text-sm focus:outline-none focus:border-[#666] w-full";

  if (isLoading) return <div className="p-10 text-white">Loading…</div>;
  if (!settings) return <div className="p-10 text-white">Failed to load settings</div>;

  const hasLinkedAccounts = settings.linkedAccountsInfo.length > 0;

  return (
    <div className="text-white pb-24">
      <div className="px-10 py-8 max-w-5xl">

        {/* ── Change theme ── */}
        <section className="mb-10">
          <h2 className="text-base font-semibold mb-4">Change theme</h2>
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
          <h2 className="text-base font-semibold mb-4">Email addresses</h2>
          <div className="flex flex-col gap-3 mb-4">
            {settings.emails.map((email) => (
              <p key={email.address} className="text-sm">
                {email.address}{" "}
                {email.isPrimary && <span className="text-[#aaa]">(Primary)</span>}
              </p>
            ))}
          </div>

          {showAddEmail ? (
            <div className="flex flex-col gap-2 max-w-sm">
              <input
                type="email"
                placeholder="Please enter your email address *"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setEmailError(""); }}
                className={`${inputStyle} ${emailError ? "border-red-500" : ""}`}
              />
              {emailError && (
                <p className="text-red-500 text-xs">{emailError}</p>
              )}
              <div className="flex gap-3 mt-1">
                <button
                  onClick={handleAddEmail}
                  className="px-5 py-2 bg-white text-black text-sm font-bold rounded cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowAddEmail(false); setNewEmail(""); setEmailError(""); }}
                  className="px-4 py-2 text-white text-sm cursor-pointer hover:text-[#aaa] transition-colors bg-transparent border-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddEmail(true)}
              className="px-4 py-2 bg-[#333] hover:bg-[#444] text-white text-sm rounded border-none cursor-pointer transition-colors"
            >
              Add an email address
            </button>
          )}
        </section>

        {/* ── Social logins ── */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-base font-semibold mb-3">
            Sign in with other social networks
            <span className="w-4 h-4 rounded-full bg-[#555] inline-flex items-center justify-center text-[11px] cursor-pointer">i</span>
          </h2>

          {!hasLinkedAccounts && (
            <p className="text-[#aaa] text-sm mb-4">
              You have not linked social accounts to your SoundCloud account.
            </p>
          )}

          <div className="flex flex-col gap-3 mb-4">
            {settings.linkedAccountsInfo.map((account) => (
              <div key={account.platform} className="flex items-center justify-between max-w-2xl">
                <div className="flex items-center gap-2">
                  {account.platform === "google" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  {account.platform === "facebook" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                  <span className="text-sm text-white">{account.name}</span>
                </div>
                <button
                  onClick={() => void handleDisconnect(account.platform)}
                  className="text-sm text-[#aaa] hover:text-white cursor-pointer bg-transparent border-none transition-colors"
                >
                  Disconnect account
                </button>
              </div>
            ))}
          </div>

          {!settings.linkedAccounts.google && (
            <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-black text-sm rounded border border-[#ddd] cursor-pointer transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Add Google account
            </button>
          )}
        </section>

        {/* ── Password ── */}
        <section className="mb-10">
          <h2 className="text-base font-semibold mb-4">Password</h2>
          {passwordResetSent && (
            <p className="text-sm text-[#aaa] mb-3">
              We&apos;ve sent an email to {settings.primaryEmail} with a link to reset your password.
            </p>
          )}
          <button
            onClick={() => void handlePasswordReset()}
            disabled={isResettingPassword || passwordResetSent}
            className="px-4 py-2 bg-[#333] hover:bg-[#444] text-white text-sm rounded border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResettingPassword ? "Sending…" : "Send password-reset link"}
          </button>
        </section>

        {/* ── Verification badge ── */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-base font-semibold mb-4">
            Verification badge
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1da1f2"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          </h2>
          <button
            onClick={() => router.push("/settings/request-verification")}
            className="px-4 py-2 bg-[#333] hover:bg-[#444] text-white text-sm rounded border-none cursor-pointer transition-colors"
          >
            Request verification
          </button>
        </section>

        {/* ── Basic information ── */}
        <section className="mb-10">
          <h2 className="text-base font-semibold mb-4">Basic information</h2>
          <div className="flex flex-wrap gap-8">
            <div>
              <label className="flex items-center gap-1 text-[#aaa] text-xs mb-2">
                Birth date
                <span className="w-4 h-4 rounded-full bg-[#555] inline-flex items-center justify-center text-[10px] cursor-pointer">i</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={settings.birthDate.month}
                  onChange={(e) => void handleBirthDateChange("month", e.target.value)}
                  className="bg-[#2a2a2a] border border-[#444] rounded text-white px-3 py-2 text-sm cursor-pointer focus:outline-none focus:border-[#666]"
                >
                  {MONTHS.map((m) => <option key={m}>{m}</option>)}
                </select>
                <select
                  value={settings.birthDate.day}
                  onChange={(e) => void handleBirthDateChange("day", Number(e.target.value))}
                  className="bg-[#2a2a2a] border border-[#444] rounded text-white px-3 py-2 text-sm cursor-pointer focus:outline-none focus:border-[#666]"
                >
                  {DAYS.map((d) => <option key={d}>{d}</option>)}
                </select>
                <select
                  value={settings.birthDate.year}
                  onChange={(e) => void handleBirthDateChange("year", Number(e.target.value))}
                  className="bg-[#2a2a2a] border border-[#444] rounded text-white px-3 py-2 text-sm cursor-pointer focus:outline-none focus:border-[#666]"
                >
                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1 text-[#aaa] text-xs mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={settings.gender}
                onChange={(e) => void handleGenderChange(e.target.value as IGender)}
                className="bg-[#2a2a2a] border border-[#444] rounded text-white px-3 py-2 text-sm cursor-pointer focus:outline-none focus:border-[#666] min-w-[160px]"
              >
                {GENDERS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* ── Connected applications ── */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-base font-semibold mb-4">
            Connected applications
            <span className="w-4 h-4 rounded-full bg-[#555] inline-flex items-center justify-center text-[11px] cursor-pointer">i</span>
          </h2>

          {settings.connectedApps.length === 0 ? (
            <p className="text-[#aaa] text-sm">No connected applications.</p>
          ) : (
            <div className="flex flex-col gap-0">
              {settings.connectedApps.map((app) => (
                <div key={app.id} className="flex items-center justify-between py-3 border-b border-[#222] max-w-2xl">
                  <span className="text-sm text-white">{app.name}</span>
                  <button
                    onClick={() => void handleRevokeApp(app.id)}
                    className="text-sm text-white font-semibold hover:text-[#aaa] cursor-pointer bg-transparent border-none transition-colors"
                  >
                    Revoke access
                  </button>
                </div>
              ))}
              <div className="flex justify-end max-w-2xl pt-3">
                <button
                  onClick={() => void handleRevokeAll()}
                  className="text-sm text-white font-semibold hover:text-[#aaa] cursor-pointer bg-transparent border-none transition-colors"
                >
                  Revoke all
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Delete account ── */}
        <section className="mb-10">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-red-500 hover:text-red-400 text-sm cursor-pointer bg-transparent border-none transition-colors"
          >
            Delete account
          </button>
        </section>

      </div>

      <SettingsFooter />

      {/* ── Delete account modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative p-8">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-white text-xl cursor-pointer bg-transparent border-none leading-none hover:text-[#aaa]"
            >
              ✕
            </button>

            <h2 className="text-white text-xl font-semibold mb-2">Delete account</h2>
            <p className="text-white text-sm mb-6">Why are you choosing to delete your account?</p>

            <div className="flex flex-col gap-3 mb-6">
              {DELETE_REASONS.map((reason) => (
                <label key={reason} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteReasons.includes(reason)}
                    onChange={() => toggleDeleteReason(reason)}
                    className="w-5 h-5 cursor-pointer accent-[#ff5500]"
                  />
                  <span className="text-white text-sm">{reason}</span>
                </label>
              ))}
              {deleteReasons.includes("Other, please specify") && (
                <input
                  type="text"
                  value={deleteOther}
                  onChange={(e) => setDeleteOther(e.target.value)}
                  className="w-full bg-[#222] border border-[#444] rounded px-3 py-2 text-white text-sm mt-1 focus:outline-none focus:border-[#666]"
                />
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer mb-8">
              <input
                type="checkbox"
                checked={deleteConfirmed}
                onChange={(e) => setDeleteConfirmed(e.target.checked)}
                className="w-5 h-5 cursor-pointer accent-[#ff5500]"
              />
              <span className="text-white text-sm">
                Yes, I want to delete my account and all my tracks, comments and stats.
              </span>
            </label>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2 text-white text-sm cursor-pointer bg-transparent border-none hover:text-[#aaa] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleDeleteAccount()}
                disabled={!deleteConfirmed || isDeleting}
                className={`px-5 py-2 text-white text-sm rounded border-none transition-colors ${
                  deleteConfirmed && !isDeleting
                    ? "bg-[#555] hover:bg-[#666] cursor-pointer"
                    : "bg-[#333] text-[#666] cursor-not-allowed"
                }`}
              >
                {isDeleting ? "Deleting…" : "Delete my account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}