"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal/LoginModal";

export default function LoginPage() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
    const token = typeof window !== "undefined" ? window.localStorage.getItem("auth_token") : null;
    const next =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next")
        : null;

    if (token) {
      router.push(next || "/stream");
      return;
    }

    router.push("/");
  };

  return (
    <>
      {isOpen && <LoginModal onClose={handleClose} />}
    </>
  );
}