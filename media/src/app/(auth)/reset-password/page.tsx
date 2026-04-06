"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AuthService } from "@/services";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [signOutEverywhere, setSignOutEverywhere] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid or expired reset link.");
      return;
    }

    setError("");
    try {
      setIsLoading(true);
      await AuthService.resetPassword(token, newPassword, signOutEverywhere);
      router.push("/reset-password/success");
    } catch {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center">
      <div className="bg-[#222222] w-125 rounded-lg p-10">
        <p className="text-white text-[24px] font-bold text-center mb-2">Change your password</p>
        <p className="text-[#999999] text-sm text-center mb-8">
          Choose a strong, unique password. For tips on choosing a secure password,{" "}
          <a href="#" className="text-[#4a90e2]"> visit our Help Center.</a>
        </p>

        <p className="text-white text-sm mb-1">Type your new password</p>
        <div className="relative mb-4">
          <input
            type={showNewPassword ? "text" : "password"}
            className="bg-[#333333] text-white w-full p-3 rounded border border-[#444444] text-sm box-border"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#999] cursor-pointer"
          >
            {showNewPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
          </button>
        </div>

        <p className="text-white text-sm mb-1">Type your new password again, to confirm</p>
        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="bg-[#333333] text-white w-full p-3 rounded border border-[#444444] text-sm box-border"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#999] cursor-pointer"
          >
            {showConfirmPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
        <input 
        type="checkbox" 
        id="signOutEverywhere" 
        className="cursor-pointer"
        checked={signOutEverywhere}
        onChange={(e) => setSignOutEverywhere(e.target.checked)}
        />
        <label htmlFor="signOutEverywhere" className="text-white text-sm cursor-pointer">
        Also sign me out everywhere
        </label>
        </div>


        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-[#333333] text-white w-full p-3 rounded cursor-pointer text-[15px] font-semibold border-none"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}