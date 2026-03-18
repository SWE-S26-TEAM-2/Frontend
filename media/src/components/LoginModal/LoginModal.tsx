"use client";

import { useState } from "react";
import { FaFacebook, FaGoogle, FaApple } from "react-icons/fa";
import Link from "next/link";
import EmailStep from "./EmailStep";
import RegisterStep from "./RegisterStep";
import SignInStep from "./SignInStep";

interface ILoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: ILoginModalProps) {
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"main" | "email" | "register" | "signin">("main");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handleSubmit = () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setStep("signin"); 
  };
  const handleEmailFocus = () => {
    setStep("email");
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };


  return (
    // Overlay — dark background behind modal
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-[1000]"
    >
      {/* Modal box — stop click from closing when clicking inside */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#222222] w-[500px] rounded-lg p-10 relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 bg-none border-none text-[#999] text-xl cursor-pointer"
        >
          ✕
        </button>
        {step === "main" && (
    <>
        <p className="text-white text-[35px] mb-4">
          Sign in or create an account
        </p>
        <p className="text-[#999999] text-sm leading-relaxed mb-8">
          By clicking on any of the &quot;Continue&quot; buttons below, you agree to SoundCloud&apos;s <Link href="#">Terms of Use</Link> and acknowledge our <Link href="#">Privacy Policy</Link>.
        </p>

        <button className="bg-[#1877f2] text-white w-full p-3 rounded cursor-pointer mb-3 text-[15px] font-semibold border-none flex items-center justify-center gap-2">
          <FaFacebook size={20} />
          Continue with Facebook
        </button>

        <button className="bg-[#333333] text-white w-full p-3 rounded cursor-pointer mb-3 text-[15px] font-semibold border-none flex items-center justify-center gap-2">
        <FaGoogle size={20} />
          Continue with Google
        </button>

        <button className="bg-black text-white w-full p-3 rounded cursor-pointer mb-8 text-[15px] font-semibold border border-[#444444] flex items-center justify-center gap-2">
        <FaApple size={20} />
          Continue with Apple
        </button>

        <p className="text-white text-sm font-semibold mb-3 mt-4">
          Or with email
        </p>

        <input
          type="email"
          placeholder="Your email address or profile URL"
          className="bg-[#333333] text-white w-full p-3 rounded border border-[#444444] text-sm mb-3 box-border"
          value={email}
          onChange={handleEmailChange}
          onFocus={handleEmailFocus}
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button className="bg-[#555555] text-white w-full p-3 rounded cursor-pointer mb-10 text-[15px] font-semibold border-none" onClick={handleSubmit}>
          Continue
        </button>

        <Link href="#" className="text-[#ff5500] text-sm cursor-pointer mt-8">
          Need help?
        </Link>
        </>
        )}
          {step === "email" && (
           <EmailStep
           email={email}
           onEmailChange={handleEmailChange}
           onSubmit={handleSubmit}
           onBack={() => setStep("main")}
           error={error}
            />
        )}
        {step === "register" && (
        <RegisterStep
        email={email}
        password={password}
        onPasswordChange={handlePasswordChange}
        onSubmit={handleSubmit}
        onBack={() => setStep("main")}
        error={error}
        />
        )}
        {step === "signin" && (
        <SignInStep
        email={email}
        password={password}
        onPasswordChange={handlePasswordChange}
        onSubmit={handleSubmit}
        onBack={() => setStep("main")}
        error={error}
        />
        )}

      </div>
    </div>
  );
}