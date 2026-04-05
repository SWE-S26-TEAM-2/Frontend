"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
//import Link from "next/link";
import {ISignInStepProps} from "@/types/auth.types";


export default function SignInStep({ emailOrProfileUrl, password, onPasswordChange, onSubmit, onBack, error , isLoading, onForgotPassword }: ISignInStepProps) {
    
    const [showPassword, setShowPassword] = useState(false);

    return(
        <div className="flex flex-col">
        <div className="flex items-center justify-center mb-6 relative">
        <button onClick={onBack} className="absolute left-0 w-10 h-10 flex items-center justify-center bg-[#333333] rounded-full cursor-pointer border-none text-white text-lg">
          ←
        </button>
        <p className="text-white text-[20px] font-bold"> Welcome back! </p>
        </div>

        <p className="text-white mb-6">We noticed that an account already exists for this email. Please sign in below</p>
        
        <p className="text-[#999999] text-sm mb-1">Your email address</p>
        <p className="text-white text-[16px] font-bold mb-6">{emailOrProfileUrl}</p>
        
        <div className="relative mb-3">
        <input
        type={showPassword ? "text" : "password"}
        placeholder="Your Password (min. 6 characters)"
        className="bg-[#333333] text-white w-full p-3 rounded border border-[#444444] text-sm box-border"
        value={password}
        onChange={onPasswordChange}
        />
        <button
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-[#999] cursor-pointer"
        >
        {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
        </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
        onClick={onSubmit}
        disabled={isLoading}
        className="bg-[#555555] text-white w-full p-3 rounded cursor-pointer mb-3 text-[15px] font-semibold border-none"
        >
        {isLoading ? "Loading..." : "Continue"}
        </button>

        <button 
        onClick={onForgotPassword} 
        className="text-[#4a90e2] text-sm cursor-pointer bg-transparent border-none p-0 text-left w-fit"
        >
        Forgot your password?
        </button>



        </div>

    );

}