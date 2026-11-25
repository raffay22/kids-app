import { Suspense } from "react";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-md rounded-3xl bg-white/90 p-6 text-center text-sm text-slate-600 shadow">
          Loading sign-up…
        </section>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
