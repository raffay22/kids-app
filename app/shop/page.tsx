import type { Metadata } from "next";
import ParentShop from "@/components/ParentShop";

export const metadata: Metadata = {
  title: "Parent Shop & Community",
};

export default function ShopPage() {
  return <ParentShop />;
}
