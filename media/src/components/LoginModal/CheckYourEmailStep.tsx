"use client";

import Link from "next/link";

interface ICheckYourEmailStepProps {
  onBack: () => void;
  onContinue: () => void;  // ← new prop
}

export default function CheckYourEmailStep({ onBack, onContinue }: ICheckYourEmailStepProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-center mb-6 relative">
        <button onClick={onBack} className="absolute left-0 w-10 h-10 flex items-center justify-center bg-[#333333] rounded-full cursor-pointer border-none text-white text-lg">
          ←
        </button>
        <p className="text-white text-[20px] font-bold">Reset password</p>
      </div>

      <p className="text-white text-[18px] font-bold mb-4">Check your email</p>

      <p className="text-white text-sm mb-6">
        We&apos;ve sent a reset code to your email address. Enter it on the next step to reset your password.
      </p>

      <button
        onClick={onContinue}
        className="bg-white text-black w-full p-3 rounded cursor-pointer mb-3 text-[15px] font-semibold border-none"
      >
        Continue
      </button>

      <p className="text-[#999999] text-sm">
        Did not receive the email? Check your spam folder or{" "}
        <Link href="https://help.soundcloud.com" className="text-[#4a90e2]">visit our Help Center</Link>.
      </p>
    </div>
  );
}