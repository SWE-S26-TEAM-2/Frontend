"use client";
import {useRouter} from "next/navigation";


export default function VerifyEmailPage() {
    const router = useRouter();
    const handleContinue = () => {
        router.push("/");
    }
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#222222] text-white">
            <h1 className="text-3xl font-bold mb-4">Check Your Email</h1>
            <p className="text-lg mb-6">We&apos;ve sent you a verification email. Please check your inbox and click the link to verify your email address.</p>
            <button onClick={handleContinue} className="bg-[#555555] text-white px-6 py-3 rounded cursor-pointer text-[15px] font-semibold border-none">
                Continue
            </button>
        </div>
    );
}