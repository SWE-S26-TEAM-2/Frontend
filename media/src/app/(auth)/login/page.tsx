"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal/LoginModal";

export default function LoginPage() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
    router.push("/stream");
  };

  return (
    <>
      {isOpen && <LoginModal onClose={handleClose} />}
    </>
  );
}