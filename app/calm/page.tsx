import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Calm Sensory Hub",
};

/** Prompt A /calm alias — calm tools live in the ASD Sensory Hub. */
export default function CalmPage() {
  redirect("/asd");
}
