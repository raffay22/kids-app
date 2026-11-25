"use client";

import Link from "next/link";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center canvas-bg p-4">
      <div className="glass-card w-full max-w-md p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/growvajuniorstudio-logo-transparent.png"
            alt="Growva Junior Studio logo"
            className="h-14 w-auto shrink-0 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </div>
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
        <p className="mt-4 text-center text-xs text-slate-500">
          <Link href="/" className="text-indigo-600 hover:underline">
            ← Back to app
          </Link>
        </p>
      </div>
    </div>
  );
}
