import type { Metadata } from "next";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/admin");

export const metadata: Metadata = {
  title: route.label,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
