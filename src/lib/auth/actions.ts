"use server";

import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import {
  loginSchema,
  registerSchema,
  profileUpdateSchema,
  privacySettingsSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from "@/lib/validations/auth";
import {
  ActionResult,
  extractFirstFieldError,
  requireAuth,
  sanitizeRedirect,
} from "@/lib/actions";

/** Create a Supabase admin client with service role key (for password resets) */
function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Normalize a Myanmar phone number: strip spaces/dashes, ensure format */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, "");
}

/** Generate a synthetic email for users without a real email */
function syntheticEmail(phone: string): string {
  const normalized = normalizePhone(phone).replace(/\D/g, "");
  return `${normalized}@rice-agent.local`;
}

/** Generate a URL-safe username from full name + random suffix, ensuring uniqueness */
async function generateUsername(
  fullName: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  const base = fullName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);

  const MAX_RETRIES = 10;
  for (let i = 0; i < MAX_RETRIES; i++) {
    const suffix = Math.floor(1000 + Math.random() * 9000).toString();
    const candidate = `${base}_${suffix}`;

    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();

    if (!data) return candidate;
  }

  // Fallback: use timestamp suffix to guarantee uniqueness
  return `${base}_${Date.now().toString(36)}`;
}

// ── OTP Store (in-memory, for testing) ────────────────────────────────
const otpStore = new Map<string, { code: string; expiresAt: number }>();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function sendOtp(phone: string): Promise<ActionResult & { code?: string }> {
  const parsed = sendOtpSchema.safeParse({ phone });
  if (!parsed.success) {
    return { success: false, error: "Please enter a valid Myanmar phone number." };
  }

  const normalized = normalizePhone(parsed.data.phone);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(normalized, { code, expiresAt: Date.now() + OTP_TTL_MS });

  // In testing: return the code so the client can show it in alert()
  return { success: true, code };
}

export async function verifyOtp(phone: string, code: string): Promise<ActionResult> {
  const parsed = verifyOtpSchema.safeParse({ phone, code });
  if (!parsed.success) {
    return { success: false, error: "Please enter a valid 6-digit OTP." };
  }

  const normalized = normalizePhone(parsed.data.phone);
  const entry = otpStore.get(normalized);

  if (!entry) {
    return { success: false, error: "OTP not found. Please request a new one." };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalized);
    return { success: false, error: "OTP has expired. Please request a new one." };
  }

  if (entry.code !== parsed.data.code) {
    return { success: false, error: "Invalid OTP. Please try again." };
  }

  otpStore.delete(normalized);
  return { success: true };
}

export async function resetPassword(
  phone: string,
  newPassword: string,
): Promise<ActionResult> {
  if (!phone || !newPassword) {
    return { success: false, error: "Phone and new password are required." };
  }

  const supabase = await createClient();
  const normalized = normalizePhone(phone);

  // Find the user ID by phone
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", normalized)
    .maybeSingle();

  if (!profile) {
    return { success: false, error: "No account found with this phone number." };
  }

  try {
    // Use admin API to update password without requiring current auth session
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(profile.id, {
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Reset password error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// ── Server Actions ────────────────────────────────────────────────────

export async function login(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  // Validate
  const parsed = loginSchema.safeParse({ phone, password });
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    const msg =
      extractFirstFieldError(fe, "phone", "password") || "Invalid input.";
    return { success: false, error: msg };
  }

  const supabase = await createClient();

  try {
    // Step 1: Look up the Supabase Auth email for this phone number
    const normalized = normalizePhone(parsed.data.phone);
    const { data: resolvedEmail, error: lookupError } = await supabase
      .rpc("lookup_email_by_phone", { phone_number: normalized });

    if (lookupError || !resolvedEmail) {
      return {
        success: false,
        error: "No account found with this phone number. Please register first.",
      };
    }

    // Step 1.5: Check if the account is soft-deleted
    const { data: profileData } = await supabase
      .from("profiles")
      .select("deleted_at")
      .eq("phone", normalized)
      .maybeSingle();

    if (profileData?.deleted_at) {
      return {
        success: false,
        error:
          "This account has been deactivated. If you would like to reactivate it, please contact support.",
      };
    }

    // Step 2: Sign in with resolved email + password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: resolvedEmail,
      password: parsed.data.password,
    });

    if (signInError) {
      return {
        success: false,
        error:
        signInError.message === "Invalid login credentials"
            ? "Invalid phone number or password."
            : signInError.message,
      };
    }

    return { success: true, redirect: sanitizeRedirect(formData.get("redirect") as string | null) };
  } catch (err) {
    console.error("Login error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function register(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  // Collect all fields from multi-step form
  const rawData = {
    full_name: formData.get("full_name") as string,
    phone: formData.get("phone") as string,
    email: (formData.get("email") as string) || undefined,
    role: formData.get("role") as string,
    region_id: formData.get("region_id") as string,
    township_id: formData.get("township_id") as string,
    bio: (formData.get("bio") as string) || undefined,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  // Validate
  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    const msg =
      extractFirstFieldError(
        fe,
        "phone", "password", "confirm_password",
        "full_name", "role", "region_id", "township_id",
      ) || "Invalid input.";
    return { success: false, error: msg };
  }

  const supabase = await createClient();
  const normalizedPhone = normalizePhone(parsed.data.phone);
  const authEmail = parsed.data.email || syntheticEmail(parsed.data.phone);
  const username = await generateUsername(parsed.data.full_name, supabase);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password: parsed.data.password,
      options: {
        data: {
          phone: normalizedPhone,
          email: parsed.data.email || null,
          username,
          full_name: parsed.data.full_name,
          role: parsed.data.role,
          region_id: parsed.data.region_id,
          township_id: parsed.data.township_id,
        },
      },
    });

    if (error) {
      if (error.message?.includes("already registered") || error.message?.includes("already exists")) {
        return {
          success: false,
          error: "This phone number is already registered. Please log in instead.",
        };
      }
      return { success: false, error: error.message };
    }

    return { success: true, redirect: sanitizeRedirect(formData.get("redirect") as string | null) };
  } catch (err) {
    console.error("Registration error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function logout(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("Logout error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// ── Profile Update ─────────────────────────────────────────────────────

export async function updateProfile(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const rawData = {
    full_name: formData.get("full_name") as string,
    role: formData.get("role") as string,
    region_id: formData.get("region_id") as string,
    township_id: formData.get("township_id") as string,
    bio: (formData.get("bio") as string) || undefined,
    market_status_id: formData.get("market_status_id") as string,
  };

  // Validate
  const parsed = profileUpdateSchema.safeParse(rawData);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    const msg =
      extractFirstFieldError(fe, "full_name", "role", "region_id", "township_id", "bio") ||
      "Invalid input.";
    return { success: false, error: msg };
  }

  // Get authenticated user
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  const { user, supabase } = auth;

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        role: parsed.data.role,
        region_id: parsed.data.region_id,
        township_id: parsed.data.township_id,
        bio: parsed.data.bio || null,
        market_status_id:
          parsed.data.market_status_id && parsed.data.market_status_id > 0
            ? parsed.data.market_status_id
            : null,
      })
      .eq("id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Update profile error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// ── Privacy Settings ──────────────────────────────────────────────────

export async function updatePrivacySettings(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const rawData = {
    phone_visibility: formData.get("phone_visibility") as string,
    email_visibility: formData.get("email_visibility") as string,
    connections_visibility: formData.get("connections_visibility") as string,
  };

  // Validate
  const parsed = privacySettingsSchema.safeParse(rawData);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    const msg =
      extractFirstFieldError(fe, "phone_visibility", "email_visibility", "connections_visibility") ||
      "Invalid input.";
    return { success: false, error: msg };
  }

  // Get authenticated user
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  const { user, supabase } = auth;

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        phone_visibility: parsed.data.phone_visibility,
        email_visibility: parsed.data.email_visibility,
        connections_visibility: parsed.data.connections_visibility,
      })
      .eq("id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Update privacy settings error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// ── Avatar Update (for post-registration) ──────────────────────────────

export async function updateAvatar(
  avatarUrl: string,
): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  const { supabase } = auth;

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", auth.user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Update avatar error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// ── Account Deletion (Soft Delete) ─────────────────────────────────────

export async function deleteAccount(): Promise<ActionResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  const { supabase } = auth;

  try {
    // Call the soft_delete_account RPC function
    const { error } = await supabase.rpc("soft_delete_account");

    if (error) {
      return { success: false, error: error.message };
    }

    // Sign the user out
    await supabase.auth.signOut();

    return { success: true, redirect: "/feed" };
  } catch (err) {
    console.error("Delete account error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
