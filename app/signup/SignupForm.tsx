"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Lock, Mail, Smile } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import FloatingInput from "@/components/auth/FloatingInput";
import { detectCountrySilently, saveProfileCountrySafe } from "@/utils/country";
import { mergeGuestProgressToAccount } from "@/utils/guestProgress";
import { createClient } from "@/utils/supabase/client";

type SchoolPreview = {
  school_name: string;
  city?: string | null;
  discount_type: string;
  monthly_price_pkr: number;
  granted_basic_pro: boolean;
};

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const schoolToken = searchParams.get("school_token")?.trim() || "";

  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [childNickname, setChildNickname] = useState("");
  const [tosAccepted, setTosAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const [school, setSchool] = useState<SchoolPreview | null>(null);
  const [schoolError, setSchoolError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolToken) {
      setSchool(null);
      setSchoolError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch(
        `/api/schools/by-token?school_token=${encodeURIComponent(schoolToken)}`,
      );
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setSchool(null);
        setSchoolError(data.error ?? "Invalid school invite link");
        return;
      }
      setSchoolError(null);
      setSchool(data.school as SchoolPreview);
    })();
    return () => {
      cancelled = true;
    };
  }, [schoolToken]);

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

    const detectedCountry = detectCountrySilently();

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { country: detectedCountry },
      },
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    if (data.user) {
      // Check if user already exists (Supabase returns empty identities array when user already exists with email confirm)
      if (data.user.identities && data.user.identities.length === 0) {
        setLoading(false);
        setError("An account with this email already exists. Please sign in instead.");
        return;
      }

      // If Supabase has email confirmation enabled, data.session is null until confirmed
      if (!data.session) {
        setLoading(false);
        setEmailConfirmationSent(true);
        return;
      }

      await supabase.from("profiles").upsert({
        id: data.user.id,
        parent_email: email,
        tos_accepted_at: new Date().toISOString(),
      });

      // Silently save detected country (falls back to user_metadata if 022 migration isn't applied yet)
      await saveProfileCountrySafe(supabase, data.user.id, detectedCountry);

      // If parent provided an optional child nickname, create the permanent child now and merge guest progress
      const trimmedNickname = childNickname.trim();
      let createdChildId: string | null = null;
      if (trimmedNickname) {
        const { data: childRow } = await supabase
          .from("children")
          .insert({
            parent_user_id: data.user.id,
            nickname: trimmedNickname,
            avatar_id: "cat-indigo",
            age_group: null,
            onboarding_completed: true,
          })
          .select("id")
          .single();

        if (childRow?.id) {
          createdChildId = childRow.id as string;
          await mergeGuestProgressToAccount(supabase, data.user.id, createdChildId);
        }
      }

      if (schoolToken) {
        const act = await fetch("/api/schools/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ school_token: schoolToken }),
        });
        const actJson = await act.json();
        if (!act.ok) {
          setLoading(false);
          setError(actJson.error ?? "Could not apply school discount");
          return;
        }
        // Persist token for checkout if paid school plan
        try {
          sessionStorage.setItem("school_token", schoolToken);
          if (actJson.monthly_price_pkr != null) {
            sessionStorage.setItem(
              "school_monthly_price_pkr",
              String(actJson.monthly_price_pkr),
            );
          }
        } catch {
          /* ignore */
        }

        setLoading(false);
        if (actJson.granted_basic_pro) {
          router.push(createdChildId ? "/" : "/onboarding?school=free");
        } else {
          router.push(`/upgrade?school_token=${encodeURIComponent(schoolToken)}`);
        }
        router.refresh();
        return;
      }

      if (createdChildId) {
        setLoading(false);
        router.push("/");
        router.refresh();
        return;
      }
    }

    setLoading(false);
    router.push("/onboarding");
    router.refresh();
  };

  if (emailConfirmationSent) {
    return (
      <AuthCard
        title="Check Your Email"
        subtitle="Verification link sent!"
        footer={
          <>
            Already confirmed?{" "}
            <Link
              href={
                schoolToken
                  ? `/login?school_token=${encodeURIComponent(schoolToken)}`
                  : "/login"
              }
              className="font-semibold text-indigo-600 hover:underline"
            >
              Sign in
            </Link>
          </>
        }
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Mail className="h-8 w-8" />
          </div>

          {/* Green Confirmation Alert Card */}
          <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 text-emerald-950 shadow-sm text-left">
            <p className="text-sm sm:text-base font-bold leading-relaxed text-emerald-900">
              📩 We have sent a verification link to your email! Please check your inbox (and spam folder) to activate your account.
            </p>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Verification link sent to:
          </p>
          <p className="rounded-xl bg-slate-100 px-3 py-2.5 font-mono text-sm font-bold text-slate-900 break-all">
            {email}
          </p>
          <p className="text-sm text-slate-600">
            Please click the link in your email to activate your account. Once verified, you can sign in to set up your child&apos;s learning profile!
          </p>
          <div className="pt-2">
            <Link
              href={
                schoolToken
                  ? `/login?school_token=${encodeURIComponent(schoolToken)}`
                  : "/login"
              }
              className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-3 text-base font-bold text-white shadow-md transition hover:bg-indigo-700"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create Account"
      subtitle="Parent email and password only — no phone required"
      footer={
        <>
          Already registered?{" "}
          <Link
            href={
              schoolToken
                ? `/login?school_token=${encodeURIComponent(schoolToken)}`
                : "/login"
            }
            className="font-semibold text-indigo-600 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {schoolToken && (
        <div
          className={`mb-4 rounded-2xl border-2 px-3 py-3 text-sm ${
            school
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : schoolError
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          <p className="flex items-center gap-2 font-bold">
            <GraduationCap className="h-4 w-4" aria-hidden />
            School partner invite
          </p>
          {school ? (
            <p className="mt-1 font-medium">
              {school.school_name}
              {school.city ? ` · ${school.city}` : ""} —{" "}
              {school.granted_basic_pro
                ? "100% Free Basic Pro on sign-up"
                : `School Partner Discount: Rs. ${school.monthly_price_pkr}/month`}
            </p>
          ) : (
            <p className="mt-1">{schoolError || "Checking invite…"}</p>
          )}
        </div>
      )}

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
        <FloatingInput
          id="signup-child-nickname"
          label="Child Nickname (optional — defaults to Explorer)"
          type="text"
          icon={Smile}
          value={childNickname}
          onChange={setChildNickname}
          autoComplete="off"
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
          School access is activated only by this secure invite link (no manual school code box).
        </p>

        <button
          type="submit"
          disabled={loading || !tosAccepted || Boolean(schoolToken && schoolError)}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-70"
        >
          {loading ? "Creating account…" : "Sign Up"}
        </button>
      </form>
    </AuthCard>
  );
}
