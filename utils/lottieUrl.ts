/** True when a Supabase/CDN Lottie URL is present and not a placeholder stub. */
export function isUsableLottieUrl(url?: string | null): url is string {
  if (!url?.trim()) return false;
  const lower = url.toLowerCase();
  if (lower.includes("placeholder.com")) return false;
  if (lower.includes("replace_me")) return false;
  return true;
}

/** Returns a trimmed URL suitable for LottiePlayer, or undefined to use SVG fallback. */
export function resolveLottieUrl(url?: string | null): string | undefined {
  return isUsableLottieUrl(url) ? url.trim() : undefined;
}
