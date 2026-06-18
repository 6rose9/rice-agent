"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { register as registerAction } from "@/lib/auth/actions";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { roleLabels } from "@/lib/mock-data";
import { useRegions } from "@/hooks/use-regions";
import { Loader2 } from "lucide-react";

function RegisterFormInner() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/feed";

  const [step, setStep] = useState<number>(1);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [serverError, setServerError] = useState("");
  const { regions, getTownshipsForRegion } = useRegions();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(registerSchema as any) as any,
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
          // ignore
        }
      }
    };
  }, [profileImagePreview]);

  async function handleNext() {
    setServerError("");

    if (step === 1) {
      const valid = await trigger(["full_name", "phone", "email", "region_id", "township_id"]);
      if (!valid) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      const valid = await trigger(["role", "bio"]);
      if (!valid) return;
      setStep(3);
      return;
    }
  }

  function handleBack() {
    setServerError("");
    setStep((s) => Math.max(1, s - 1));
  }

  async function onSubmit(data: RegisterInput) {
    setServerError("");

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

    const result = await registerAction({ success: false }, formData);

    if (!result.success) {
      setServerError(result.error || "Registration failed. Please try again.");
      return;
    }

    window.location.href = result.redirect || redirect;
  }

  // Collect field errors for current step display
  const step1Fields = ["full_name", "phone", "email", "region_id", "township_id"] as const;
  const step2Fields = ["role", "bio"] as const;
  const step3Fields = ["password", "confirm_password"] as const;

  const currentStepFields =
    step === 1 ? step1Fields : step === 2 ? step2Fields : step3Fields;

  const stepErrors = currentStepFields
    .map((f) => errors[f]?.message)
    .filter(Boolean) as string[];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-[480px]">
        <CardHeader className="text-center">
          <div className="text-3xl mb-2">🍚</div>
          <CardTitle>Join စပါးအောင်သွယ်</CardTitle>
          <CardDescription>
            Connect with Myanmar&apos;s rice community
          </CardDescription>
          <p className="text-sm mt-2">Step {step} of 3</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <label htmlFor="profile-image" className="cursor-pointer">
                      <Button type="button" variant="outline">Upload Image</Button>
                    </label>
                    <input
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
                      {Object.entries(roleLabels).map(([value, label]) => (
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
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 6 characters"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">
                    Confirm Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Re-enter your password"
                    {...register("confirm_password")}
                  />
                  {errors.confirm_password && (
                    <p className="text-sm text-destructive">
                      {errors.confirm_password.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Errors ── */}
            {stepErrors.length > 0 && (
              <div className="space-y-1">
                {stepErrors.map((msg, i) => (
                  <p key={i} className="text-sm text-destructive">
                    {msg}
                  </p>
                ))}
              </div>
            )}
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
                  <Button type="submit" disabled={isSubmitting}>
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
