"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

function GoogleLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

interface GoogleButtonProps {
  /** Where to send the user after a successful Google sign-in. */
  callbackUrl?: string;
}

/**
 * "Continue with Google" button that matches the InterviewAI dark theme.
 * - Shows a loading state ("Connecting to Google...") and blocks double clicks.
 * - Disables itself with a clear message when GOOGLE_CLIENT_ID/SECRET are missing.
 * - Never exposes provider details, tokens or stack traces.
 */
export default function GoogleButton({ callbackUrl = "/dashboard" }: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/google-status")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setAvailable(Boolean(data?.available));
        setConfigured(true);
      })
      .catch(() => {
        if (cancelled) return;
        setAvailable(false);
        setConfigured(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGoogleLogin = async () => {
    if (loading || !available) return;
    setError("");
    setLoading(true);
    try {
      // Full-page redirect to Google. Only reached back here on failure.
      await signIn("google", { callbackUrl });
    } catch (_err) {
      setError("Unable to start Google sign-in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4" aria-hidden="true">
        <div className="h-px flex-1 bg-gray-800" />
        <span className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Or
        </span>
        <div className="h-px flex-1 bg-gray-800" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading || !available}
        aria-disabled={loading || !available}
        aria-live="polite"
        className="group flex w-full cursor-pointer items-center justify-center gap-2.5 bg-gray-800/50 border border-gray-700 py-2.5 px-4 rounded-lg text-gray-200 font-medium transition-all hover:bg-gray-800 hover:border-gray-500 hover:shadow-md hover:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-gray-800/50 disabled:hover:border-gray-700 disabled:hover:shadow-none select-none"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-purple-400" aria-hidden="true" />
        ) : (
          <GoogleLogo />
        )}
        <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
      </button>

      {configured && !available && (
        <p className="text-center text-xs leading-relaxed text-amber-400/90">
          Google sign-in is not configured yet. Please add{" "}
          <code className="rounded bg-white/[0.06] px-1 py-0.5 font-mono text-[11px] text-amber-300">
            GOOGLE_CLIENT_ID
          </code>{" "}
          and{" "}
          <code className="rounded bg-white/[0.06] px-1 py-0.5 font-mono text-[11px] text-amber-300">
            GOOGLE_CLIENT_SECRET
          </code>{" "}
          to your environment variables. Email &amp; password login is unaffected.
        </p>
      )}

      {error && (
        <p className="text-center text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}