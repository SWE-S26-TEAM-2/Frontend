"use client";

import { useRouter } from "next/navigation";

export default function ResetPasswordSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center">
      <div className="bg-[#222222] w-170 rounded-lg p-10 text-center">
        <p className="text-white text-[24px] font-bold mb-8">
          You have successfully changed your password.
        </p>

        <button
          onClick={() => router.push("/")}
          className="bg-white text-black px-10 py-3 rounded cursor-pointer text-[15px] font-semibold border-none"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}