import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginButton from "@/components/LoginButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const hasError = params?.error === "auth_callback_failed";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background glow */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo / Brand */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 border border-amber-400/20 bg-amber-400/5">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "#f0f0f8" }}
          >
            Markd
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            Your bookmarks, beautifully organised.
          </p>
        </div>

        {/* Login Card */}
        <div
          className="card p-8"
          style={{ background: "var(--bg-surface)", borderRadius: "20px" }}
        >
          {hasError && (
            <div
              className="mb-6 px-4 py-3 rounded-lg text-sm"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
              }}
              role="alert"
            >
              Authentication failed. Please try again.
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(251,191,36,0.1)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p
                  className="font-medium text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  Private by default
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  Your bookmarks are only visible to you
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(251,191,36,0.1)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </div>
              <div>
                <p
                  className="font-medium text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  Real-time sync
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  Updates instantly across all your tabs
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(251,191,36,0.1)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p
                  className="font-medium text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  Lightning fast
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  Add and delete bookmarks in seconds
                </p>
              </div>
            </div>
          </div>

          <div
            className="mb-6"
            style={{
              height: "1px",
              background: "var(--border-subtle)",
            }}
          />

          <LoginButton />

          <p className="text-center text-xs mt-4" style={{ color: "var(--text-secondary)" }}>
            By signing in, you agree to our{" "}
            <span style={{ color: "var(--accent)" }}>terms of service</span> and{" "}
            <span style={{ color: "var(--accent)" }}>privacy policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
