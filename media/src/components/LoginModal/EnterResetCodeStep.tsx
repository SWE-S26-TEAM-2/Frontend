"use client";

import { useState } from "react";
import { IEnterResetCodeStepProps } from "@/types/auth.types";
import { AuthService } from "@/services";

export default function EnterResetCodeStep({ onBack, onContinue }: IEnterResetCodeStepProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter the code from your email.");
      return;
    }
    setError("");
    try {
      setIsLoading(true);
      const { valid, message } = await AuthService.verifyResetToken(code.trim());
      if (!valid) {
        setError(message || "Invalid or expired code. Please try again.");
        return;
      }
      onContinue(code.trim()); // only proceeds if valid
    } catch {
      setError("Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <div className="flex items-center justify-center mb-6 relative">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-0 w-10 h-10 flex items-center justify-center bg-[#333333] rounded-full cursor-pointer border-none text-white text-lg"
        >
          ←
        </button>
        <p className="text-white text-[20px] font-bold">Reset password</p>
      </div>

      <p className="text-white text-sm mb-6">
        Paste the reset code from your email below.
      </p>

      <input
        type="text"
        placeholder="Paste your reset code here"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="bg-[#333333] text-white w-full p-3 rounded border border-[#444444] text-sm mb-3 box-border"
        autoFocus
      />

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="bg-white text-black w-full p-3 rounded cursor-pointer text-[15px] font-semibold border-none"
      >
        {isLoading ? "Verifying..." : "Continue"}
      </button>
    </form>
  );
}