import type { Metadata } from "next";
import SlowTracingPad from "@/components/asd/SlowTracingPad";

export const metadata: Metadata = {
  title: "Slow Tracing Pad",
};

export default function TracePage() {
  return <SlowTracingPad />;
}
