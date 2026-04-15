"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Account", href: "/settings/account" },
  { label: "Content", href: "/settings/content" },
  { label: "Notifications", href: "/settings/notifications" },
  { label: "Privacy", href: "/settings/privacy" },
  { label: "Advertising", href: "/settings/advertising" },
  { label: "2FA", href: "/settings/two-factor" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ backgroundColor: "#121212", color: "#fff", minHeight: "100vh", fontFamily: "Arial" }}>
      <div style={{ padding: "40px 40px 0 40px" }}>
        <h1 style={{ marginBottom: "24px" }}>Settings</h1>
        <div style={{ display: "flex", gap: "32px", borderBottom: "1px solid #333" }}>
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  color: isActive ? "#fff" : "#aaa",
                  textDecoration: "none",
                  paddingBottom: "12px",
                  borderBottom: isActive ? "2px solid #fff" : "2px solid transparent",
                  fontWeight: isActive ? "bold" : "normal",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}