"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import FloatingInput from "@/components/auth/FloatingInput";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      setError("Supabase is not configured. Add credentials to .env.local");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const redirectTo = `${window.location.origin}/login`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Check your email for a password reset link.");
  };

  return (
    <AuthCard
      title="Reset Password"
      subtitle="We'll email you a secure reset link"
      footer={
        <>
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FloatingInput
          id="forgot-email"
          label="Parent Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />

        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}
        {message && (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-70"
        >
          {loading ? "Sending…" : "Send Reset Link"}
        </button>
      </form>
    </AuthCard>
  );
}
