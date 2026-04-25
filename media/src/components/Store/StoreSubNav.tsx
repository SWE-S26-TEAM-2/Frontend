"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

const NAV_LINKS = [
  { label: "All", href: "/store" },
  { label: "Tees", href: "/store?category=tees" },
  { label: "Sweatshirts", href: "/store?category=sweatshirts" },
  { label: "Hats", href: "/store?category=hats" },
  { label: "Essentials", href: "/store?category=essentials" },
];

interface IStoreSubNavProps {
  activeCategory: string;
  cartCount: number;
  onCategoryChange: (category: string) => void;
}

export function StoreSubNav({ activeCategory, cartCount, onCategoryChange }: IStoreSubNavProps) {
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-[#e8e8e1]">
      <div className="max-w-300 mx-auto px-5 h-15 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/store" className="shrink-0">
          <Image
            src="/store/store-logo.svg"
            alt="SoundCloud Store"
            width={180}
            height={20}
            className="h-5 w-auto"
            priority
          />
        </Link>

        {/* Category nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ label }) => {
            const isActive = activeCategory === label.toLowerCase();
            return (
              <button
                key={label}
                onClick={() => onCategoryChange(label.toLowerCase())}
                className={`px-3.5 py-1.5 text-[14px] transition-colors rounded-sm ${
                  isActive
                    ? "text-[#1c1d1d] font-semibold underline underline-offset-4 decoration-[#FF5500] decoration-2"
                    : "text-[#757575] hover:text-[#1c1d1d]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* Right: account + Cart */}
        <div className="flex items-center gap-5 shrink-0">
          {isLoggedIn && user ? (
            <Link
              href={`/${user.username}`}
              className="hidden sm:flex items-center gap-2 text-[14px] text-[#1c1d1d] hover:underline"
            >
              <Image
                src={user.profileImageUrl ?? "/your-avatar.jpg"}
                alt={user.username}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
              <span>{user.username}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:block text-[14px] text-[#1c1d1d] hover:underline"
            >
              Log in
            </Link>
          )}

          <Link href="/store/cart" className="relative flex items-center">
            {/* Cart icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1c1d1d"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF5500] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
