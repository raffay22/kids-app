import type { Metadata } from "next";
import CoinShopGame from "@/components/CoinShopGame";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/games/coin-shop");

export const metadata: Metadata = {
  title: route.label,
};

export default function CoinShopPage() {
  return <CoinShopGame />;
}
