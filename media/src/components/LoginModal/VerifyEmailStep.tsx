"use client";

import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { AuthService } from "@/services";

export default function VerifyEmailStep({
  email,
  onBack,
  onVerified,
}: {
  email: string;
  onBack: () => void;
  onVerified: () => void;
}) {
  const [code, setCode]           = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verified, setVerified]   = useState(false);

  const [resent, setResent]         = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState("");

  const handleVerify = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!code.trim()) { setVerifyError("Please enter the code from your email."); return; }
    try {
      setIsVerifying(true);
      setVerifyError("");
      await AuthService.verifyEmail(email, code.trim());
      setVerified(true);
      setTimeout(onVerified, 1200);
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

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

      <p className="text-base text-center mb-1">We sent a verification code to</p>
      <p className="text-base font-bold text-center mb-6">{email}</p>

      <div className="mb-6 bg-[#333333] rounded-full p-8">
        <IoMdMail size={80} color="white" />
      </div>

      {verified ? (
        <p className="text-green-400 font-semibold text-center mb-4">
          Email verified! Signing you in...
        </p>
      ) : (
        <form onSubmit={handleVerify} className="w-full flex flex-col gap-3 mb-4">
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-[#333333] text-white w-full p-3 rounded border border-[#444444] text-sm text-center tracking-widest box-border"
            autoFocus
          />
          {verifyError && <p className="text-red-500 text-sm text-center">{verifyError}</p>}
          <button
            type="submit"
            disabled={isVerifying}
            className="bg-[#ff5500] text-white w-full p-3 rounded cursor-pointer text-[15px] font-semibold border-none"
          >
            {isVerifying ? "Verifying..." : "Verify email"}
          </button>
        </form>
      )}

      <button
        onClick={() => window.open("https://mail.google.com", "_blank")}
        className="bg-white text-black w-full p-3 rounded cursor-pointer mb-4 text-[15px] font-semibold border-none flex items-center justify-center gap-2"
      >
        <FaGoogle size={18} />
        Open Gmail
      </button>

      <p className="text-[#999999] text-sm text-center mb-2">
        No code in your inbox or spam?{" "}
        {resent ? (
          <span className="text-[#ff5500]">Code sent!</span>
        ) : (
          <span
            onClick={handleResend}
            className="text-[#4a90e2] cursor-pointer hover:underline"
          >
            {isResending ? "Sending..." : "Send again"}
          </span>
        )}
        {resendError && <span className="text-red-500 text-xs mt-1">{resendError}</span>}
        </p>


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