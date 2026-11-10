import type { Metadata } from "next";
import CoinShopGame from "@/components/CoinShopGame";

export const metadata: Metadata = {
  title: "Tap-to-Fill Color Shop",
};

export default function ShopPage() {
  return <CoinShopGame />;
}
