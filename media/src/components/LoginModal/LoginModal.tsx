"use client";

import { useState } from "react";
import { FaFacebook, FaApple, FaGoogle } from "react-icons/fa";
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
import { useGoogleLogin } from "@react-oauth/google";
import ForgotPasswordStep from "./ForgotPasswordStep";
import CheckYourEmailStep from "./CheckYourEmailStep";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function LoginModal({ onClose }: ILoginModalProps) {
  const authStore = useAuthStore();

  const [emailOrProfileUrl, setEmailOrProfileUrl] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"main" | "input" | "register" | "signin"|"tell-us-more"|"verify-email"| "forgot-password" | "check-your-email">("main");
  const [password, setPassword] = useState("");
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const router = useRouter();
  const [signinSubtitle, setSigninSubtitle] = useState<string | undefined>(undefined);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailOrProfileUrl(e.target.value);
  };
  const handleGoogleLogin = useGoogleLogin({
    onSuccess:async (response)=> {
      try{
      setIsLoading(true);
      await AuthService.googleLogin(response.access_token);
      router.push("/track/1");
      
      }catch{
        setError("Google login failed. Please try again.");
      }finally{
        setIsLoading(false);
      }
    },
    onError: () =>{
      setError("Google login failed. Please try again.");
    }
  })

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
    setSigninSubtitle(undefined);
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
        //console.log("isExisting:", isExisting);
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
      if (step === "signin" && password.length < 6) {
        setError("Password must be at least 6 characters.");
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
          window.localStorage.setItem("auth_token", response.token);
          window.localStorage.setItem("auth_user_id", String(response.user.id));
          setIsSuccess(true);
          setTimeout(onClose, 1500);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (step === "register" && msg.toLowerCase().includes("already registered")) {
          try {
            const response = await AuthService.login(emailOrProfileUrl, password);
            authStore.login(response.user, response.token);
            window.localStorage.setItem("auth_token", response.token);
            window.localStorage.setItem("auth_user_id", String(response.user.id));
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

 

  const handleForgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      //const finalDisplayName = data.displayName || emailOrProfileUrl.split("@")[0];
     // await AuthService.updateProfile({ ...data, displayName: finalDisplayName });
     await AuthService.forgotPassword(email); // (or your real API)
    setStep("check-your-email");
    } catch {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
   // setStep("verify-email");
  };
  const handleVerified = async () => {
    try {
      const response = await AuthService.login(emailOrProfileUrl, password);
      authStore.login(response.user, response.token);
      window.localStorage.setItem("auth_token", response.token);
      window.localStorage.setItem("auth_user_id", String(response.user.id));
      setIsSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setStep("signin");
      setSigninSubtitle("Your email was verified! Please sign in to continue.");
      setError(msg || "");
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-1000"
    >
      {/* Modal box — stop click from closing when clicking inside */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#222222] w-125 rounded-lg p-10 relative"
      >
        <button
          onClick={() =>  onClose()}
          className="absolute top-3 right-4 bg-none border-none text-[#999] text-xl cursor-pointer"
        >
          ✕
        </button>

        {step === "main" && (
          <>
            <p className="text-white text-[35px] mb-4">Sign in or create an account</p>
            <p className="text-[#999999] text-sm leading-relaxed mb-8">
              By clicking on any of the &quot;Continue&quot; buttons below, you agree to SoundCloud&apos;s{" "}
              <Link href="https://soundcloud.com/terms-of-use">Terms of Use</Link> and acknowledge our{" "}
              <Link href="https://soundcloud.com/pages/privacy">Privacy Policy</Link>.
            </p>

            <button className="bg-[#1877f2] text-white w-full p-3 rounded cursor-pointer mb-3 text-[15px] font-semibold border-none flex items-center justify-center gap-2">
              <FaFacebook size={20} />
              Continue with Facebook
            </button>

            <div className="hidden" ref={googleButtonRef}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (!credentialResponse.credential) return;
                  try {
                    setIsLoading(true);
                    const response = await AuthService.googleLogin(credentialResponse.credential);
                    authStore.login(response.user, response.token);
                    window.localStorage.setItem("auth_token", response.token);
                    window.localStorage.setItem("auth_user_id", String(response.user.id));
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

            <button
            onClick={() => googleButtonRef.current?.querySelector("div[role=button]")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))}
            className="bg-[#333333] text-white w-full p-3 rounded cursor-pointer mb-3 text-[15px] font-semibold border border-[#444444] flex items-center justify-center gap-2"
            >
            <FaGoogle size={20} />
            Continue with Google
            </button>

            <button className="bg-black text-white w-full p-3 rounded cursor-pointer mb-8 text-[15px] font-semibold border border-[#444444] flex items-center justify-center gap-2">
              <FaApple size={20} />
              Continue with Apple
            </button>

            <p className="text-white text-sm font-semibold mb-3 mt-4">Or with email</p>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
              type="submit"
              className="bg-[#555555] text-white w-full p-3 rounded cursor-pointer mb-10 text-[15px] font-semibold border-none"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Continue"}
            </button>
            </form>

        <Link href="https://help.soundcloud.com/hc/en-us/sections/46266771825691" className="text-[#4a90e2] text-sm cursor-pointer">
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
        onBack={() => {setStep("main"); setError("");}}
        error={error}
        isLoading={isLoading}
        subtitle={signinSubtitle}
        onForgotPassword={() => { setStep("forgot-password"); setError(""); }}
        />
        )}
        {step === "forgot-password" && (
        <ForgotPasswordStep
        emailOrProfileUrl={emailOrProfileUrl}
        onBack={() => { setStep("signin"); setError(""); }}
        onSubmit={handleForgotPassword}
        isLoading={isLoading}
        />
        )}
        {step === "check-your-email" && (
        <CheckYourEmailStep
        onBack={() => { setStep("signin"); setError(""); }}
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
            onVerified={handleVerified}
          />
        )}
      </div>
    </div>
  );
}
