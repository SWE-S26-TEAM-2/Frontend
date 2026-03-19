"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

interface IRegisterStepProps {
    emailOrProfileUrl: string;
    password: string;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onBack: () => void;
    error: string;
    isLoading: boolean;
}

export default function RegisterStep({ emailOrProfileUrl, password, onPasswordChange, onSubmit, onBack, error, isLoading }: IRegisterStepProps) {
    
    const [showPassword, setShowPassword] = useState(false);
    
    return (
        <div className="flex flex-col">
        <div className="flex items-center justify-center mb-6 relative">
        <button onClick={onBack} className="absolute left-0 w-10 h-10 flex items-center justify-center bg-[#333333] rounded-full cursor-pointer border-none text-white text-lg">
          ←
        </button>
        <p className="text-white text-[20px] font-bold"> Create an account</p>
        </div>

        <p className="text-[#999999] text-sm mb-1">Your email address</p>
        <p className="text-white text-[16px] font-bold mb-6">{emailOrProfileUrl}</p>

        <div className="relative mb-3">
        <input
        type={showPassword ? "text" : "password"}
        placeholder="Choose a password (min. 8 characters)"
        className="bg-[#333333] text-white w-full p-3 rounded border border-[#444444] text-sm box-border"
        value={password}
        onChange={onPasswordChange}
        />
        <button
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-[#999] cursor-pointer"
        >
        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
        onClick={onSubmit}
        disabled={isLoading}
        className="bg-[#555555] text-white w-full p-3 rounded cursor-pointer mb-16 text-[15px] font-semibold border-none"
        >
        {isLoading ? "Loading..." : "Continue"}
        </button>

        <Link href="#" className="text-[#ff5500] text-sm cursor-pointer mt-8">
        Need help?
        </Link>

        </div>
    );
}