import type { Metadata } from "next";
import ToyShopRide from "@/components/coin-shop/ToyShopRide";

export const metadata: Metadata = {
  title: "Math and Coin Toy Shop",
};

export default function CoinShopPage() {
  return <ToyShopRide />;
}
