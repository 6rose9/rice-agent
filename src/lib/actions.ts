import { createClient } from "@/lib/supabase/server";

// ── Shared Types ─────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data?: T; redirect?: string }
  | { success: false; error: string; redirect?: string };

// ── Shared Helpers ───────────────────────────────────────────────────

/** Extract the first error message for a field from Zod's flattened fieldErrors */
export function extractFirstFieldError(
  fieldErrors: Record<string, string[] | undefined>,
  ...fields: string[]
): string | undefined {
  for (const field of fields) {
    const msg = fieldErrors[field]?.[0];
    if (msg) return msg;
  }
  return undefined;
}

type AuthSuccess = {
  ok: true;
  user: NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["getUser"]>>["data"]["user"]>;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

type AuthFailure = {
  ok: false;
} & ActionResult;

/** Get the authenticated user or return an ActionResult error */
export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, success: false, error: "Not authenticated." };
  }
  return { ok: true, user, supabase };
}
