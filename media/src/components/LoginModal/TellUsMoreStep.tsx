"use client";

import { useState } from "react";
import type { ITellUsMoreStepProps } from "@/types/auth.types";

export default function TellUsMoreStep({
  onSubmit,
  onBack,
  isLoading,
}: ITellUsMoreStepProps) {

    const [displayName, setDisplayName] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");
    const [year, setYear] = useState("");
    const [gender, setGender] = useState("");
    const [localError, setLocalError] = useState("");

    const handleSubmit = () => {
        if (!month || !day || !year) {
          setLocalError("Please enter your date of birth.");
          return;
        }
        const birthDate = new Date(`${month} ${day}, ${year}`);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        if (age < 14) {
        setLocalError("You must be at least 14 years old to register.");
        return;
    }
        if (!gender) {
          setLocalError("Please select your gender.");
          return;
        }
        setLocalError("");
        onSubmit({ displayName, month, day, year, gender });
      };

  return (
    <div className="text-white">
             {/* Back button + Title */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="bg-[#333333] rounded-full w-9 h-9 flex items-center justify-center cursor-pointer border-none text-white">
          ‹
        </button>
        <h2 className="text-2xl font-bold">Tell us more about you</h2>
      </div>
             {/* Display Name */}
     <input
        type="text"
        placeholder="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="bg-[#333333] text-white w-full p-3 rounded border border-[#444444] text-sm mb-2 box-border"
      />
    <p className="text-[#999999] text-xs mb-6">Your display name can be anything you like. Your name or artist name are good choices.</p>

             {/* Date of Birth */}
    <p className="font-bold mb-3">Date of birth (required)</p>
    <div className="flex gap-3 mb-2">
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="bg-[#333333] text-white p-3 rounded border border-[#444444] text-sm flex-1 cursor-pointer">
          <option value="">Month</option>
          {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select value={day} onChange={(e) => setDay(e.target.value)} className="bg-[#333333] text-white p-3 rounded border border-[#444444] text-sm flex-1 cursor-pointer">
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-[#333333] text-white p-3 rounded border border-[#444444] text-sm flex-1 cursor-pointer">
          <option value="">Year</option>
          {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

    </div>
    <p className="text-[#999999] text-xs mb-6">Your date of birth is used to verify your age and is not shared publicly.</p>

             {/* Gender */}
    <select value={gender} onChange={(e) => setGender(e.target.value)} className="bg-[#333333] text-white w-full p-3 rounded border border-[#444444] text-sm mb-6 cursor-pointer">
    <option value="">Gender (required)</option>
    <option value="male">Male</option>
    <option value="female">Female</option>
    <option value="other">Other</option>
    <option value="prefer_not_to_say">Prefer not to say</option>
    </select>

    {localError && <p className="text-red-500 text-sm mb-3">{localError}</p>}

             {/* Continue */}
    <button onClick={handleSubmit} disabled={isLoading} className="bg-[#555555] text-white w-full p-3 rounded cursor-pointer text-[15px] font-semibold border-none">
    {isLoading ? "Loading..." : "Continue"}
    </button>
    </div>
    );
}