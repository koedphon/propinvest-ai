// Admin / unlimited-VIP accounts are configured via the VITE_ADMIN_EMAILS env var
// (comma-separated). Matching is exact (case-insensitive) - no substring matching.
const raw = (import.meta as any).env?.VITE_ADMIN_EMAILS || '';
export const ADMIN_EMAILS: string[] = String(raw)
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

export const UNLIMITED_VIP_EMAIL = ADMIN_EMAILS[0] || '';

export const isAdminUser = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

export const isUnlimitedVipUser = (email?: string | null): boolean => isAdminUser(email);
