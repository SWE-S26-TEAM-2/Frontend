"use client";

import { useState } from "react";
import { FaFacebook, FaApple } from "react-icons/fa";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import InputStep from "./InputStep";
import RegisterStep from "./RegisterStep";
import SignInStep from "./SignInStep";
import TellUsMoreStep from "./TellUsMoreStep";
import VerifyEmailStep from "./VerifyEmailStep";
import { AuthService } from "@/services";
import { useAuthStore } from "@/store/authStore";
import type { ILoginModalProps } from "@/types/ui.types";

export default function LoginModal({ onClose }: ILoginModalProps) {
  const authStore = useAuthStore();

  const [emailOrProfileUrl, setEmailOrProfileUrl] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"main" | "input" | "register" | "signin" | "tell-us-more" | "verify-email">("main");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailOrProfileUrl(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleEmailFocus = () => {
    setStep("input");
  };

  const resetToMain = () => {
    setStep("main");
    setError("");
    setIsSuccess(false);
  };

  const handleSubmit = async () => {
    if (step === "input" || step === "main") {
      if (!emailOrProfileUrl) {
        setError("Please enter your email address.");
        return;
      }
      const isEmail = /\S+@\S+\.\S+/.test(emailOrProfileUrl);
      const isProfileUrl = emailOrProfileUrl.startsWith("soundcloud.com/");
      if (!isEmail && !isProfileUrl) {
        setError("Please enter a valid email address or profile URL.");
        return;
      }
      setError("");
      try {
        setIsLoading(true);
        const { isExisting } = await AuthService.checkEmail(emailOrProfileUrl);
        setStep(isExisting ? "signin" : "register");
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    if (step === "register" || step === "signin") {
      if (!password) {
        setError("Please enter your password.");
        return;
      }
      if (step === "register" && password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (step === "register" && !captchaToken) {
        setError("Please verify you are a human.");
        return;
      }
      setError("");
      try {
        setIsLoading(true);
        if (step === "register") {
          await AuthService.register(emailOrProfileUrl, password);
          setStep("tell-us-more");
        } else {
          const response = await AuthService.login(emailOrProfileUrl, password);
          authStore.login(response.user, response.token);
          setIsSuccess(true);
          setTimeout(onClose, 1500);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (step === "register" && msg.toLowerCase().includes("already registered")) {
          try {
            const response = await AuthService.login(emailOrProfileUrl, password);
            authStore.login(response.user, response.token);
            setIsSuccess(true);
            setTimeout(onClose, 1500);
          } catch {
            setStep("signin");
            setError("An account with this email already exists. Please sign in.");
          }
        } else {
          setError(msg || "Incorrect password. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTellUsMoreSubmit = async (data: {
    displayName: string;
    month: string;
    day: string;
    year: string;
    gender: string;
  }) => {
    try {
      setIsLoading(true);
      const finalDisplayName = data.displayName || emailOrProfileUrl.split("@")[0];
      await AuthService.updateProfile({ ...data, displayName: finalDisplayName });
    } catch {
      // No token yet before email verification — proceed anyway
    } finally {
      setIsLoading(false);
    }
    setStep("verify-email");
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-1000"
    >
      {isSuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#333333] text-white px-6 py-4 rounded-lg z-2000">
          Successfully signed in! 🎉
        </div>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#222222] w-125 rounded-lg p-10 relative"
      >
        <button
          onClick={() => { onClose(); setIsSuccess(false); }}
          className="absolute top-3 right-4 bg-none border-none text-[#999] text-xl cursor-pointer"
        >
          ✕
        </button>

        {step === "main" && (
          <>
            <p className="text-white text-[35px] mb-4">Sign in or create an account</p>
            <p className="text-[#999999] text-sm leading-relaxed mb-8">
              By clicking on any of the &quot;Continue&quot; buttons below, you agree to SoundCloud&apos;s{" "}
              <Link href="#">Terms of Use</Link> and acknowledge our{" "}
              <Link href="#">Privacy Policy</Link>.
            </p>

            <button className="bg-[#1877f2] text-white w-full p-3 rounded cursor-pointer mb-3 text-[15px] font-semibold border-none flex items-center justify-center gap-2">
              <FaFacebook size={20} />
              Continue with Facebook
            </button>

            <div className="mb-3 [&>div]:w-full [&_iframe]:w-full">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (!credentialResponse.credential) return;
                  try {
                    setIsLoading(true);
                    const response = await AuthService.googleLogin(credentialResponse.credential);
                    authStore.login(response.user, response.token);
                    setIsSuccess(true);
                    setTimeout(onClose, 1500);
                  } catch {
                    setError("Google login failed. Please try again.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                onError={() => setError("Google login failed. Please try again.")}
                theme="filled_black"
                text="continue_with"
                width="400"
              />
            </div>

            <button className="bg-black text-white w-full p-3 rounded cursor-pointer mb-8 text-[15px] font-semibold border border-[#444444] flex items-center justify-center gap-2">
              <FaApple size={20} />
              Continue with Apple
            </button>

            <p className="text-white text-sm font-semibold mb-3 mt-4">Or with email</p>

            <input
              type="text"
              placeholder="Your email address or profile URL"
              className="bg-[#333333] text-white w-full p-3 rounded border border-[#444444] text-sm mb-3 box-border"
              value={emailOrProfileUrl}
              onChange={handleInputChange}
              onFocus={handleEmailFocus}
            />

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <button
              className="bg-[#555555] text-white w-full p-3 rounded cursor-pointer mb-10 text-[15px] font-semibold border-none"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Continue"}
            </button>

            <Link href="#" className="text-[#ff5500] text-sm cursor-pointer mt-8">
              Need help?
            </Link>
          </>
        )}

        {step === "input" && (
          <InputStep
            emailOrProfileUrl={emailOrProfileUrl}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onBack={resetToMain}
            error={error}
            isLoading={isLoading}
          />
        )}

        {step === "register" && (
          <RegisterStep
            emailOrProfileUrl={emailOrProfileUrl}
            password={password}
            onPasswordChange={handlePasswordChange}
            onSubmit={handleSubmit}
            onBack={resetToMain}
            error={error}
            isLoading={isLoading}
            onCaptchaChange={(token) => setCaptchaToken(token)}
          />
        )}

        {step === "signin" && (
          <SignInStep
            emailOrProfileUrl={emailOrProfileUrl}
            password={password}
            onPasswordChange={handlePasswordChange}
            onSubmit={handleSubmit}
            onBack={resetToMain}
            error={error}
            isLoading={isLoading}
          />
        )}

        {step === "tell-us-more" && (
          <TellUsMoreStep
            onSubmit={handleTellUsMoreSubmit}
            onBack={resetToMain}
            isLoading={isLoading}
          />
        )}

        {step === "verify-email" && (
          <VerifyEmailStep
            email={emailOrProfileUrl}
            onBack={resetToMain}
          />
        )}
      </div>
    </div>
  );
}
