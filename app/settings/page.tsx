import type { Metadata } from "next";
import SettingsPanel from "@/components/SettingsPanel";
import { getRouteMeta } from "@/utils/navigation";

const route = getRouteMeta("/settings");

export const metadata: Metadata = {
  title: route.label,
};

export default function SettingsPage() {
  return <SettingsPanel />;
}
