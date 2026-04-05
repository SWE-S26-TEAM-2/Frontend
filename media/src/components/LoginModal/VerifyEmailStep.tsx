"use client";
import { useState } from "react";
import type { IVerifyEmailStepProps } from "@/types/ui.types";
import { FaGoogle } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { AuthService } from "@/services";

export default function VerifyEmailStep({ email, onBack }: IVerifyEmailStepProps) {
    const [resent, setResent] = useState(false);
const [isResending, setIsResending] = useState(false);
const [resendError, setResendError] = useState("");

const handleResend = async () => {
  try {
    setIsResending(true);
    setResendError("");
    await AuthService.resendVerification(email);
    setResent(true);
  } catch {
    setResendError("Failed to resend. Please try again.");
  } finally {
    setIsResending(false);
  }
};
    

    return (
       <div className="flex flex-col items-center text-white">
        <h1 className="text-3xl font-bold mb-4">Check your inbox!</h1>

        <p className="text-base text-center mb-2">
         Click on the link we sent to
        </p>

        <p className="text-base font-bold text-center mb-6">{email}</p>

        <p className="text-xs text-[#999999] text-center mb-6">
         No email in your inbox or spam folder?{" "}
        {resent ? (
        <span className="text-[#4a90e2]">Email sent!</span>
        ) : (
        <span
        onClick={handleResend}
        className="text-[#4a90e2] cursor-pointer hover:underline"
        >
        {isResending ? "Sending..." : "Send again"}
        </span>
        )}
        {resendError && <p className="text-red-500 text-xs mt-1">{resendError}</p>}
        </p>

        <div className="mb-6 bg-[#333333] rounded-full p-8">
        <IoMdMail size={80} color="white" />
        </div>

        <button
        onClick={() => window.open("https://mail.google.com", "_blank")}
        className="bg-white text-black w-full p-3 rounded cursor-pointer mb-4 text-[20px] font-semibold border-none flex items-center justify-center gap-2"
        >
        <FaGoogle size={20} />
        Open Gmail
        </button>

        <p className="text-[#999999] text-sm text-center mb-2">
         Wrong address?{" "}
        <span
        onClick={onBack}
        className="text-[#4a90e2] cursor-pointer hover:underline"
        >
        Back to login
        </span>
        </p>

        <p className="text-[#999999] text-sm text-center">
        If you still need help, visit our{" "}
        <span className="text-[#4a90e2] cursor-pointer hover:underline">
        Help Center.
        </span>
        </p>



      </div>
    );
  }