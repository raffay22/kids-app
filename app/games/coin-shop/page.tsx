import type { Metadata } from "next";
import ToyShopRide from "@/components/coin-shop/ToyShopRide";
import ProGameGuard from "@/components/ProGameGuard";

export const metadata: Metadata = {
  title: "Coin Toy Shop",
};

/** 3D aisle walk + Saving Bank coin shop (separate from supermarket trolley). */
export default function CoinShopPage() {
  return (
    <ProGameGuard gameTitle="Coin Toy Shop">
      <ToyShopRide />
    </ProGameGuard>
  );
}
