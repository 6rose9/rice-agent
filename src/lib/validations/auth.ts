import { z } from "zod";

// Myanmar phone number regex
// Accepts: 09xxxxxxxxx, 09xxxxxxxxx, +959xxxxxxxx, 959xxxxxxxx
const myanmarPhoneRegex = /^(09\d{7,9}|\+?959\d{7,8})$/;

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine((val) => {
    const normalized = val.replace(/[\s-]/g, "");
    return myanmarPhoneRegex.test(normalized);
  }, "Please enter a valid Myanmar phone number (e.g. 09123456789)");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

// ── Login ────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ── Register (multi-step) ────────────────────────────────────────────
export const registerStep1Schema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  phone: phoneSchema,
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
});

export const registerStep2Schema = z.object({
  role: z.enum(["farmer", "trader", "agent", "general_user"], {
    message: "Please select a role",
  }),
  region_id: z.coerce
    .number({ message: "Please select your region" })
    .min(1, "Please select your region"),
  township_id: z.coerce
    .number({ message: "Please select your township" })
    .min(1, "Please select your township"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export const registerStep3Schema = z
  .object({
    password: passwordSchema,
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

// Full register schema (used server-side)
export const registerSchema = registerStep1Schema
  .merge(registerStep2Schema)
  .merge(registerStep3Schema);

export type RegisterInput = z.infer<typeof registerSchema>;

// ── Profile Update ─────────────────────────────────────────────────────
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  role: z.enum(["farmer", "trader", "agent", "general_user"], {
    message: "Please select a role",
  }),
  region_id: z.coerce
    .number({ message: "Please select your region" })
    .min(1, "Please select your region"),
  township_id: z.coerce
    .number({ message: "Please select your township" })
    .min(1, "Please select your township"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  market_status_id: z.coerce.number().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// ── Privacy Settings ────────────────────────────────────────────────────
export const visibilityEnum = z.enum(
  ["public", "followers", "private"],
  { message: "Please select a visibility option" }
);

export const connectionVisibilityEnum = z.enum(
  ["public", "connections", "private"],
  { message: "Please select a visibility option" }
);

export const privacySettingsSchema = z.object({
  phone_visibility: visibilityEnum,
  email_visibility: visibilityEnum,
  connections_visibility: connectionVisibilityEnum,
});

export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>;

// ── OTP ────────────────────────────────────────────────────────────────
export const otpSchema = z
  .string()
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d{6}$/, "OTP must contain only digits");

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: otpSchema,
});

// ── Form state types for useActionState ───────────────────────────────
export interface AuthFormState {
  errors?: {
    phone?: string[];
    password?: string[];
    full_name?: string[];
    email?: string[];
    role?: string[];
    region_id?: string[];
    township_id?: string[];
    bio?: string[];
    confirm_password?: string[];
    market_status_id?: string[];
    phone_visibility?: string[];
    email_visibility?: string[];
    connections_visibility?: string[];
  };
  message?: string;
}
