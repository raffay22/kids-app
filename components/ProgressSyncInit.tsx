"use client";

import { useEffect } from "react";
import { initProgressSync } from "@/utils/logProgress";

export default function ProgressSyncInit() {
  useEffect(() => {
    initProgressSync();
  }, []);

  return null;
}
