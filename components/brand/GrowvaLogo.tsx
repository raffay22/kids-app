"use client";

import { BRAND } from "@/utils/brand";
import { GROWVA_BRAND_URL } from "@/utils/siteLinks";

type Props = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  dark?: boolean;
};

export default function GrowvaLogo({
  size = 40,
  showWordmark = true,
  className = "",
  dark = false,
}: Props) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BRAND.logoSrc}
        alt="Growva Junior"
        width={size}
        height={size}
        className="shrink-0 rounded-xl bg-white/95 object-contain p-1 shadow-md"
      />
      {showWordmark && (
        <div className="min-w-0 leading-tight">
          <a
            href={GROWVA_BRAND_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`block truncate text-sm font-extrabold tracking-tight hover:underline ${
              dark ? "text-white" : "text-slate-900"
            }`}
          >
            {BRAND.name}
          </a>
          <p
            className={`truncate text-[11px] font-semibold ${
              dark ? "text-indigo-100" : "text-indigo-600"
            }`}
          >
            {BRAND.product}
          </p>
        </div>
      )}
    </div>
  );
}
