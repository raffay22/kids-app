import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="glass-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-800">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-600">Last updated: July 21, 2026</p>

        <div className="prose prose-slate mt-6 max-w-none space-y-6 text-sm text-slate-700">
          <section>
            <h2 className="text-lg font-bold text-slate-800">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using Kids Learning App, you agree to these Terms of
              Service and our Privacy Policy. This service is intended for parents and guardians
              managing child learning profiles under COPPA/GDPR-safe guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">2. Subscription & Billing</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Free Tier:</strong> Includes one child profile with limited daily
                practice across feature routes.
              </li>
              <li>
                <strong>Pro Pass:</strong> Monthly or yearly subscription unlocking extended
                practice, up to three child profiles, and premium features.
              </li>
              <li>
                <strong>Family Pack Add-on:</strong> Extends child profile limit to six total
                profiles on an active Pro Pass account.
              </li>
              <li>
                Prices may vary by region (USD/EUR internationally; PKR locally inclusive of
                applicable taxes such as 13% GST in Pakistan).
              </li>
              <li>
                School coupon codes (e.g., SCHOOL50) apply percentage discounts as displayed at
                checkout and may be subject to usage limits and expiration dates.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">3. Cancellation & Refunds</h2>
            <p>
              You may cancel auto-renewing subscriptions through your account settings or by
              contacting support before the next billing cycle. Cancellation takes effect at the
              end of the current paid period; access remains until expiration.
            </p>
            <p>
              Refunds are evaluated case-by-case for duplicate charges or verified billing errors
              within 14 days of purchase. Manual payment receipts (JazzCash, Easypaisa, Payoneer)
              require admin verification before activation — refunds for approved manual payments
              follow the same 14-day review window.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">4. Acceptable Use</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Accounts must be created and managed by a parent or legal guardian.</li>
              <li>
                Real child photo uploads are prohibited; only pre-designed vector avatars and
                nicknames are permitted.
              </li>
              <li>
                You may not reverse-engineer, scrape, resell, or misuse the platform for
                non-educational commercial purposes.
              </li>
              <li>
                Admin, coupon, and payment verification tools are restricted to authorized
                personnel.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">5. Liability Limits</h2>
            <p>
              Kids Learning App is an educational support tool, not a medical or clinical
              diagnosis service. We do not guarantee specific speech, developmental, or academic
              outcomes. To the fullest extent permitted by law, our liability is limited to the
              amount you paid for the service in the twelve (12) months preceding a claim.
            </p>
            <p>
              The app is provided &quot;as is&quot; without warranties of uninterrupted or
              error-free operation, though we strive for high availability via PWA offline
              caching.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">6. Contact</h2>
            <p>
              Questions about these terms? Visit{" "}
              <Link href="/settings" className="text-indigo-600 hover:underline">
                Settings
              </Link>{" "}
              or email your registered parent address on file.
            </p>
          </section>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          <Link href="/privacy" className="text-indigo-600 hover:underline">
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/" className="text-indigo-600 hover:underline">
            Back to app
          </Link>
        </p>
      </section>
    </div>
  );
}
