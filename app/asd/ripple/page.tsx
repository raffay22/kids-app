import type { Metadata } from "next";
import RippleSoundRoom from "@/components/asd/RippleSoundRoom";

export const metadata: Metadata = {
  title: "Ripple Sound Room",
};

export default function RipplePage() {
  return <RippleSoundRoom />;
}
