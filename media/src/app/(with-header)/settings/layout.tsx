"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Account", href: "/settings/account" },
  { label: "Content", href: "/settings/content" },
  { label: "Notifications", href: "/settings/notifications" },
  { label: "Privacy", href: "/settings/privacy" },
  { label: "Advertising", href: "/settings/advertising" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="bg-[#121212] text-white min-h-screen font-sans">
      <div className="max-w-screen-xl mx-auto px-10">
        <div className="pt-10 pb-0">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <div className="flex gap-8 border-b border-[#333] overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`whitespace-nowrap pb-3 text-sm border-b-2 transition-colors ${
                    isActive
                      ? "text-white border-white font-bold"
                      : "text-[#aaa] border-transparent font-normal hover:text-white"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-10">
        {children}
      </div>
    </div>
  );
}