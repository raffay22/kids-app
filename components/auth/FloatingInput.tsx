"use client";

import type { LucideIcon } from "lucide-react";

type FloatingInputProps = {
  id: string;
  label: string;
  type?: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
};

export default function FloatingInput({
  id,
  label,
  type = "text",
  icon: Icon,
  value,
  onChange,
  required,
  autoComplete,
  minLength,
}: FloatingInputProps) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-400"
        aria-hidden
      />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        placeholder=" "
        className="peer w-full rounded-2xl border-2 border-white/80 bg-white/70 py-3.5 pl-12 pr-4 text-slate-800 shadow-inner outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-sm text-slate-500 transition-all peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-indigo-600"
      >
        {label}
      </label>
    </div>
  );
}
