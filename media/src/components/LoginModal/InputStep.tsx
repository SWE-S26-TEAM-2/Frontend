"use client";

import Link from "next/link";
import {IInputStepProps} from "@/types/auth.types";


  export default function InputStep({ emailOrProfileUrl, onInputChange, onSubmit, onBack, error, isLoading }: IInputStepProps) {
    return (
        <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="flex items-center justify-center mb-6 relative">
        <button type="button" onClick={onBack} className="absolute left-0 bg-[#333333] rounded-full p-2 cursor-pointer border-none text-white">
          ←
        </button>
        <p className="text-white text-[20px] font-bold">Sign in or create an account</p>
        </div>

        <input
        type="text"
        placeholder="Your email address or profile URL"
        className="bg-[#333333] text-white w-full p-3 rounded border border-[#444444] text-sm mb-3 box-border"
        value={emailOrProfileUrl}
        onChange={onInputChange}
        autoFocus
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
         type="submit"
         disabled={isLoading}
         className="bg-[#555555] text-white w-full p-3 rounded cursor-pointer mb-3 text-[15px] font-semibold border-none"
        >
         {isLoading ? "Loading..." : "Continue"}
        </button>

        <Link href="https://help.soundcloud.com" className="text-[#4a90e2] text-sm cursor-pointer">
        Need help?
        </Link>
        </form>
        
    );
  }