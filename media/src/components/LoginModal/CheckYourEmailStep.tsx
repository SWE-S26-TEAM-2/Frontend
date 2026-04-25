"use client";

import Link from "next/link";
import { ICheckYourEmailStepProps } from "@/types/auth.types";

export default function CheckYourEmailStep({ onBack }: ICheckYourEmailStepProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-center mb-6 relative">
        <button onClick={onBack} className="absolute left-0 w-10 h-10 flex items-center justify-center bg-[#333333] rounded-full cursor-pointer border-none text-white text-lg">
          ←
        </button>
        <p className="text-white text-[20px] font-bold">Reset password</p>
      </div>

      <p className="text-white text-[18px] font-bold mb-4">Check your email</p>

      <p className="text-white text-sm mb-3">
        We&apos;ve sent instructions on how to change your password to your email address.
      </p>

      <button
        onClick={onBack}
        className="bg-white text-black w-full p-3 rounded cursor-pointer mb-3 text-[15px] font-semibold border-none"
      >
        Back to login
      </button>

      <p className="text-[#999999] text-sm">
        Did not receive the email? Check your spam folder or{" "}
        <Link href="https://help.soundcloud.com" className="text-[#4a90e2]">visit our Help Center</Link>.
      </p>
    </div>
  );
}
