"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { register as registerAction, updateAvatar } from "@/lib/auth/actions";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS } from "@/lib/constants";
import { useRegions } from "@/hooks/use-regions";
import { Loader2, Eye, EyeOff } from "lucide-react";

function RegisterFormInner() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/feed";

  const [step, setStep] = useState<number>(1);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { regions, getTownshipsForRegion } = useRegions();
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<RegisterInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(registerSchema as any) as any,
    mode: "onSubmit",
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      role: undefined,
      region_id: 0,
      township_id: 0,
      bio: "",
      password: "",
      confirm_password: "",
    },
  });

  const watchedRegionId = watch("region_id");
  const watchedTownshipId = watch("township_id");
  const watchedFullName = watch("full_name");

  // Townships filtered by selected region
  const townships = useMemo(() => {
    if (!watchedRegionId || watchedRegionId < 1) return [];
    return getTownshipsForRegion(watchedRegionId);
  }, [watchedRegionId, getTownshipsForRegion]);

  // Reset township when region changes
  function handleRegionChange(value: string | null) {
    const regionId = Number(value ?? 0);
    setValue("region_id", regionId, { shouldValidate: true });
    setValue("township_id", 0, { shouldValidate: false });
  }

  function handleProfileImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setProfileImageFile(file);
    if (!file) {
      setProfileImagePreview("");
      return;
    }
    setProfileImagePreview(URL.createObjectURL(file));
  }

  useEffect(() => {
    return () => {
      if (profileImagePreview) {
        try {
          URL.revokeObjectURL(profileImagePreview);
        } catch {
          console.warn("Failed to revoke object URL for profile image preview");
        }
      }
    };
  }, [profileImagePreview]);

  async function handleNext() {
    setServerError("");

    if (step === 1) {
      const valid = await trigger(["full_name", "phone", "email", "region_id", "township_id"]);
      if (!valid) return;
      clearErrors();
      setStep(2);
      return;
    }

    if (step === 2) {
      const valid = await trigger(["role", "bio"]);
      if (!valid) return;
      clearErrors();
      setStep(3);
      return;
    }
  }

  function handleBack() {
    setServerError("");
    clearErrors();
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleCreateAccount() {
    setServerError("");

    // Validate all fields before submitting
    const valid = await trigger();
    if (!valid) {
      // Navigate to the first step that has errors
      if (step1Fields.some((f) => errors[f])) {
        setStep(1);
      } else if (step2Fields.some((f) => errors[f])) {
        setStep(2);
      }
      // Step 3 errors are already visible
      return;
    }

    // All valid — submit
    handleSubmit(onSubmit)();
  }

  async function onSubmit(data: RegisterInput) {
    setServerError("");

    // Upload profile image if one was selected
    let avatarUrl = "";
    if (profileImageFile) {
      try {
        const supabase = createClient();
        const ext = profileImageFile.name.split(".").pop();
        const path = `avatars/temp/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("profiles")
          .upload(path, profileImageFile, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("profiles")
            .getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      } catch (error) {
        console.error("Error uploading profile image:", error);
        // Image upload failed — continue registration without it
      }
    }

    const formData = new FormData();
    formData.append("full_name", data.full_name);
    formData.append("phone", data.phone);
    if (data.email) formData.append("email", data.email);
    formData.append("role", data.role);
    formData.append("region_id", String(data.region_id));
    formData.append("township_id", String(data.township_id));
    if (data.bio) formData.append("bio", data.bio);
    formData.append("password", data.password);
    formData.append("confirm_password", data.confirm_password);
    formData.append("redirect", redirect);

    const result = await registerAction(null, formData);

    if (!result.success) {
      setServerError(result.error || "Registration failed. Please try again.");
      return;
    }

    // Update avatar after registration (profile row exists by now)
    if (avatarUrl) {
      await updateAvatar(avatarUrl);
    }

    window.location.href = result.redirect || redirect;
  }

  // Field groups for step navigation on failed submit
  const step1Fields = ["full_name", "phone", "email", "region_id", "township_id"] as const;
  const step2Fields = ["role", "bio"] as const;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-[480px]">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <Image src="/logo.svg" alt="စပါးအောင်သွယ်" width={64} height={64} />
          </div>
          <CardTitle>Join စပါးအောင်သွယ်</CardTitle>
          <CardDescription>
            Connect with Myanmar&apos;s rice community
          </CardDescription>
          <p className="text-sm mt-2">Step {step} of 3</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {/* ── Step 1: Basic Info ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="U Mg Mg"
                    {...register("full_name")}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive">{errors.full_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="09xxxxxxxxx"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    Myanmar phone format required (e.g. 09123456789)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region_id">
                    Region <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={watchedRegionId > 0 ? String(watchedRegionId) : ""}
                    onValueChange={handleRegionChange}
                  >
                    <SelectTrigger id="region_id" className="w-full">
                      {watchedRegionId > 0
                        ? regions.find((r) => r.id === watchedRegionId)?.name.en
                        : "Select region"}
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.name.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.region_id && (
                    <p className="text-sm text-destructive">{errors.region_id.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="township_id">
                    Township <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={watchedTownshipId > 0 ? String(watchedTownshipId) : ""}
                    onValueChange={(v) =>
                      setValue("township_id", Number(v ?? 0), { shouldValidate: true })
                    }
                    disabled={!watchedRegionId || watchedRegionId < 1}
                  >
                    <SelectTrigger id="township_id" className="w-full">
                      {watchedTownshipId > 0
                        ? townships.find((t) => t.id === watchedTownshipId)?.name.en
                        : watchedRegionId && watchedRegionId > 0
                          ? "Select township"
                          : "Select a region first"}
                    </SelectTrigger>
                    <SelectContent>
                      {townships.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.township_id && (
                    <p className="text-sm text-destructive">{errors.township_id.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 2: Profile ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar size="lg">
                    {profileImagePreview ? (
                      <AvatarImage
                        src={profileImagePreview}
                        alt="Profile preview"
                      />
                    ) : (
                      <AvatarFallback>
                        {watchedFullName
                          ? watchedFullName.charAt(0).toUpperCase()
                          : "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => profileImageInputRef.current?.click()}
                    >
                      Upload Image
                    </Button>
                    <input
                      ref={profileImageInputRef}
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageChange}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={getValues("role") || ""}
                    onValueChange={(v) =>
                      setValue("role", (v ?? "general_user") as RegisterInput["role"], {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Choose your profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="A short bio or profile description"
                    {...register("bio")}
                  />
                  {errors.bio && (
                    <p className="text-sm text-destructive">{errors.bio.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 3: Password ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 6 characters"
                      {...register("password")}
                      className="pr-9"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">
                    Confirm Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      {...register("confirm_password")}
                      className="pr-9"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-sm text-destructive">
                      {errors.confirm_password.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Server Error ── */}
            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            {/* ── Navigation ── */}
            <div className="flex items-center justify-between">
              <div>
                {step > 1 ? (
                  <Button type="button" variant="secondary" onClick={handleBack}>
                    Back
                  </Button>
                ) : (
                  <div />
                )}
              </div>
              <div className="flex items-center gap-2">
                {step < 3 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="button" disabled={isSubmitting} onClick={handleCreateAccount}>
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Create Account
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={
                redirect !== "/feed"
                  ? `/login?redirect=${encodeURIComponent(redirect)}`
                  : "/login"
              }
              className="text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
          <Link href="/feed" className="text-xs text-muted-foreground hover:text-primary">
            ← Back to Feed
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

function RegisterFormFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-[480px]">
        <CardHeader className="text-center">
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFormFallback />}>
      <RegisterFormInner />
    </Suspense>
  );
}
