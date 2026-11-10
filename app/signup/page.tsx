"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import FloatingInput from "@/components/auth/FloatingInput";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
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
  const [tosAccepted, setTosAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!tosAccepted) {
      setError("You must agree to the Terms of Service and Privacy Policy to sign up.");
      return;
    }

    if (!supabase) {
      setError("Supabase is not configured. Add credentials to .env.local");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        parent_email: email,
        tos_accepted_at: new Date().toISOString(),
      });
    }

    setLoading(false);
    router.push("/onboarding");
    router.refresh();
  };

  return (
    <AuthCard
      title="Create Account"
      subtitle="Parent email and password only — no phone required"
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FloatingInput
          id="signup-email"
          label="Parent Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />
        <FloatingInput
          id="signup-password"
          label="Password"
          type="password"
          icon={Lock}
          value={password}
          onChange={setPassword}
          required
          autoComplete="new-password"
          minLength={6}
        />

        <label className="flex items-start gap-3 rounded-2xl bg-white/60 p-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={tosAccepted}
            onChange={(e) => setTosAccepted(e.target.checked)}
            required
            className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="font-semibold text-indigo-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" className="font-semibold text-indigo-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}

        <p className="text-xs text-slate-500">
          COPPA/GDPR safe: we never collect child photos — only a nickname and vector avatar during onboarding.
        </p>

        <button
          type="submit"
          disabled={loading || !tosAccepted}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-70"
        >
          {loading ? "Creating account…" : "Sign Up"}
        </button>
      </form>
    </AuthCard>
  );
}
