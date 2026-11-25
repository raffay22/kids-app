import type { Metadata } from "next";
import ManualPaymentPage from "@/components/ManualPaymentPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pro Payment",
};

export default function PaymentRoutePage() {
  return <ManualPaymentPage />;
}
