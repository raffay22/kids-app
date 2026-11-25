import type { Metadata } from "next";
import { Suspense } from "react";
import UpgradeCheckout from "@/components/UpgradeCheckout";

export const metadata: Metadata = {
  title: "Upgrade",
};

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <section className="glass-card p-6 text-sm text-slate-600">
          Loading checkout…
        </section>
      }
    >
      <UpgradeCheckout />
    </Suspense>
  );
}
