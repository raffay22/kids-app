"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";

type InfoTooltipProps = {
  text: string;
  label?: string;
};

/** Small (i) control with accessible expandable tip text. */
export default function InfoTooltip({
  text,
  label = "More info",
}: InfoTooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm hover:bg-indigo-100"
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
        <span className="sr-only">(i)</span>
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-0 top-8 z-30 w-64 rounded-2xl border border-indigo-100 bg-white px-3 py-2 text-left text-xs font-medium leading-snug text-slate-600 shadow-xl sm:w-72"
        >
          {text}
        </span>
      )}
    </span>
  );
}
