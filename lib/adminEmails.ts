/**
 * Hard-coded + env admin allowlist.
 * DB `profiles.is_admin` must also be true for RLS; this list drives
 * auto-promotion and client/server admin UI checks.
 */
const HARDCODED_ADMIN_EMAILS = ["maria.umeed1987@gmail.com"] as const;

function parseEnvEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
  return raw
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Normalized lowercase admin emails. */
export function getAdminEmails(): string[] {
  const set = new Set<string>([
    ...HARDCODED_ADMIN_EMAILS.map((e) => e.toLowerCase()),
    ...parseEnvEmails(),
  ]);
  return [...set];
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
