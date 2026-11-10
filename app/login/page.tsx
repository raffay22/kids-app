"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import FloatingInput from "@/components/auth/FloatingInput";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in with your parent email"
      footer={
        <>
          No account?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FloatingInput
          id="login-email"
          label="Parent Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />
        <FloatingInput
          id="login-password"
          label="Password"
          type="password"
          icon={Lock}
          value={password}
          onChange={setPassword}
          required
          autoComplete="current-password"
          minLength={6}
        />

        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-70"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <p className="text-center text-sm">
          <Link href="/forgot-password" className="text-indigo-600 hover:underline">
            Forgot password?
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
