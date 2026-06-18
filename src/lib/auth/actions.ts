"use server";

import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  profileUpdateSchema,
} from "@/lib/validations/auth";

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

/** Generate a URL-safe username from full name + random suffix */
function generateUsername(fullName: string): string {
  const base = fullName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);
  const suffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `${base}_${suffix}`;
}

// ── Server Actions ────────────────────────────────────────────────────

export type AuthActionResult = {
  success: boolean;
  error?: string;
  redirect?: string;
};

export async function login(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  // Validate
  const parsed = loginSchema.safeParse({ phone, password });
  if (!parsed.success) {
    const firstError = parsed.error.flatten().fieldErrors;
    const msg =
      firstError.phone?.[0] ||
      firstError.password?.[0] ||
      "Invalid input.";
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

    return { success: true, redirect: formData.get("redirect") as string || "/feed" };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Login failed. Please try again.",
    };
  }
}

export async function register(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
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
    const firstError = parsed.error.flatten().fieldErrors;
    const msg =
      firstError.phone?.[0] ||
      firstError.password?.[0] ||
      firstError.confirm_password?.[0] ||
      firstError.full_name?.[0] ||
      firstError.role?.[0] ||
      firstError.region_id?.[0] ||
      firstError.township_id?.[0] ||
      "Invalid input.";
    return { success: false, error: msg };
  }

  const supabase = await createClient();
  const normalizedPhone = normalizePhone(parsed.data.phone);
  const authEmail = parsed.data.email || syntheticEmail(parsed.data.phone);
  const username = generateUsername(parsed.data.full_name);

  try {
    const { error } = await supabase.auth.signUp({
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

    // Save avatar URL if provided
    const avatarUrl = formData.get("avatar_url") as string;
    if (avatarUrl && supabase.auth.getUser) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ avatar_url: avatarUrl })
          .eq("id", user.id);
      }
    }

    return { success: true, redirect: formData.get("redirect") as string || "/feed" };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Registration failed. Please try again.",
    };
  }
}

export async function logout(): Promise<AuthActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ── Profile Update ─────────────────────────────────────────────────────

export type ProfileActionResult = {
  success: boolean;
  error?: string;
  redirect?: string;
};

export async function updateProfile(
  _prevState: ProfileActionResult | null,
  formData: FormData,
): Promise<ProfileActionResult> {
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
    const firstError = parsed.error.flatten().fieldErrors;
    const msg =
      firstError.full_name?.[0] ||
      firstError.role?.[0] ||
      firstError.region_id?.[0] ||
      firstError.township_id?.[0] ||
      firstError.bio?.[0] ||
      "Invalid input.";
    return { success: false, error: msg };
  }

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

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
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update profile.",
    };
  }
}

// ── Account Deletion (Soft Delete) ─────────────────────────────────────

export async function deleteAccount(): Promise<AuthActionResult> {
  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

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
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to delete account.",
    };
  }
}

// ── Check if account is deleted (used by login flow) ───────────────────

export async function checkAccountDeleted(
  phone: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("deleted_at")
    .eq("phone", phone)
    .maybeSingle();

  return data?.deleted_at != null;
}
