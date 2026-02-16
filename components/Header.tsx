"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/lib/types";

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background: "rgba(7,7,26,0.85)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Markd
          </span>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Open user menu"
            aria-expanded={isMenuOpen}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-150"
            style={{
              background: isMenuOpen ? "rgba(255,255,255,0.08)" : "transparent",
              border: "1px solid",
              borderColor: isMenuOpen ? "var(--border-default)" : "transparent",
            }}
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-semibold flex-shrink-0"
              style={{
                background: "rgba(251,191,36,0.2)",
                color: "#fbbf24",
                fontSize: "11px",
              }}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={28}
                  height={28}
                  className="object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <span
              className="text-sm font-medium hidden sm:block max-w-[120px] truncate"
              style={{ color: "var(--text-secondary)" }}
            >
              {displayName}
            </span>

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                color: "var(--text-secondary)",
                transform: isMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Dropdown */}
          {isMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden shadow-xl z-50 animate-scale-in"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
              }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  Signed in as
                </p>
                <p
                  className="text-sm font-medium truncate mt-0.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {user.email}
                </p>
              </div>

              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full px-4 py-3 text-left text-sm flex items-center gap-2.5 transition-colors"
                style={{
                  color: isSigningOut ? "var(--text-secondary)" : "#f87171",
                  cursor: isSigningOut ? "not-allowed" : "pointer",
                  background: "transparent",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  if (!isSigningOut) {
                    e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {isSigningOut ? (
                  <svg
                    className="animate-spin"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                )}
                {isSigningOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
