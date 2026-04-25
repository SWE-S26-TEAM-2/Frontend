"use client";

import Link from "next/link";
import { useState } from "react";
import { IForgotPasswordStepProps } from "@/types/auth.types";

export default function ForgotPasswordStep({ emailOrProfileUrl, onBack, onSubmit, isLoading }: IForgotPasswordStepProps) {
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!emailOrProfileUrl) {
      setError("No email address found.");
      return;
    }
    setError("");
    onSubmit(emailOrProfileUrl);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-center mb-6 relative">
        <button onClick={onBack} className="absolute left-0 w-10 h-10 flex items-center justify-center bg-[#333333] rounded-full cursor-pointer border-none text-white text-lg">
          ←
        </button>
        <p className="text-white text-[20px] font-bold">Reset password</p>
      </div>

      <div className="bg-[#333333] p-3 rounded border border-[#444444] mb-4">
        <p className="text-[#999999] text-xs mb-1">Your email address</p>
        <p className="text-white text-[14px]">{emailOrProfileUrl}</p>
      </div>

      <p className="text-[#999999] text-sm mb-6">
        If the email address is in our database, we will send you an email to reset your password.{" "}
        <Link href="#" className="text-[#4a90e2]">Need help? visit our Help Center.</Link>
      </p>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="bg-white text-black w-full p-3 rounded cursor-pointer mb-0 text-[15px] font-semibold border-none"
      >
        {isLoading ? "Sending..." : "Send reset link"}
      </button>
    </div>
  );
}