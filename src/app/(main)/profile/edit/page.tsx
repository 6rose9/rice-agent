"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProfile, deleteAccount } from "@/lib/auth/actions";
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from "@/lib/validations/auth";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { mockMarketStatuses, roleLabels } from "@/lib/mock-data";
import { useRegions } from "@/hooks/use-regions";
import {
  Loader2,
  AlertTriangle,
  ArrowLeft,
  UserCog,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function EditProfileInner() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, refreshProfile } = useAuth();
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const { regions, getTownshipsForRegion } = useRegions();

  const currentProfile = user?.profile;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileUpdateSchema as any) as any,
    values: {
      full_name: currentProfile?.full_name ?? "",
      role: (currentProfile?.role ?? "general_user") as ProfileUpdateInput["role"],
      region_id: currentProfile?.region_id ?? 0,
      township_id: currentProfile?.township_id ?? 0,
      bio: currentProfile?.bio ?? "",
      market_status_id: currentProfile?.market_status_id ?? 0,
    },
  });

  const watchedRegionId = watch("region_id");
  const watchedTownshipId = watch("township_id");
  const watchedMarketStatusId = watch("market_status_id");

  // Townships filtered by selected region
  const townships = useMemo(() => {
    if (!watchedRegionId || watchedRegionId < 1) return [];
    return getTownshipsForRegion(watchedRegionId);
  }, [watchedRegionId, getTownshipsForRegion]);

  // Clean up success message after timeout
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  function handleRegionChange(value: string | null) {
    const regionId = Number(value ?? 0);
    setValue("region_id", regionId, { shouldValidate: true });
    setValue("township_id", 0, { shouldValidate: false });
  }

  async function onSubmit(data: ProfileUpdateInput) {
    setServerError("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("full_name", data.full_name);
    formData.append("role", data.role);
    formData.append("region_id", String(data.region_id));
    formData.append("township_id", String(data.township_id));
    if (data.bio) formData.append("bio", data.bio);
    if (data.market_status_id && data.market_status_id > 0) {
      formData.append("market_status_id", String(data.market_status_id));
    }

    const result = await updateProfile({ success: false }, formData);

    if (!result.success) {
      setServerError(result.error || "Failed to update profile.");
      return;
    }

    setSuccessMessage("Profile updated successfully!");

    // Refresh the auth context so the UI picks up changes immediately
    await refreshProfile();
    router.refresh();
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setDeleteError("");

    const result = await deleteAccount();

    if (!result.success) {
      setDeleteError(result.error || "Failed to delete account.");
      setIsDeleting(false);
      return;
    }

    router.push("/feed");
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-[520px]">
          <CardHeader className="text-center">
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !currentProfile) {
    return (
      <SignInGate
        icon={UserCog}
        title="Sign in to edit your profile"
        description="Update your name, role, location, and more."
        redirectTo="/profile/edit"
      />
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-[780px] space-y-6">
        {/* Back link */}
        <Link
          href={`/profile/${currentProfile.username}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>

        {/* Edit Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your public profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
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
                  <p className="text-sm text-destructive">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              {/* Phone (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={currentProfile.phone}
                  disabled
                  className="bg-muted"
                />
                <p className="text-[10px] text-muted-foreground">
                  Phone number cannot be changed.
                </p>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={getValues("role") || ""}
                  onValueChange={(v) =>
                    setValue(
                      "role",
                      (v ?? "general_user") as ProfileUpdateInput["role"],
                      { shouldValidate: true }
                    )
                  }
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Choose your role" />
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
                  <p className="text-sm text-destructive">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Region */}
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
                  <p className="text-sm text-destructive">
                    {errors.region_id.message}
                  </p>
                )}
              </div>

              {/* Township */}
              <div className="space-y-2">
                <Label htmlFor="township_id">
                  Township <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={
                    watchedTownshipId > 0
                      ? String(watchedTownshipId)
                      : ""
                  }
                  onValueChange={(v) =>
                    setValue("township_id", Number(v ?? 0), {
                      shouldValidate: true,
                    })
                  }
                  disabled={!watchedRegionId || watchedRegionId < 1}
                >
                  <SelectTrigger id="township_id" className="w-full">
                    {watchedTownshipId > 0
                      ? townships.find((t) => t.id === watchedTownshipId)
                          ?.name.en
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
                  <p className="text-sm text-destructive">
                    {errors.township_id.message}
                  </p>
                )}
              </div>

              {/* Market Status */}
              <div className="space-y-2">
                <Label htmlFor="market_status_id">Market Status</Label>
                <Select
                  value={
                    (watchedMarketStatusId ?? 0) > 0
                      ? String(watchedMarketStatusId)
                      : ""
                  }
                  onValueChange={(v) =>
                    setValue("market_status_id", Number(v ?? 0), {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="market_status_id" className="w-full">
                    {(watchedMarketStatusId ?? 0) > 0
                      ? mockMarketStatuses.find(
                          (ms) => ms.id === watchedMarketStatusId
                        )?.name.en
                      : "No status (optional)"}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No status</SelectItem>
                    {mockMarketStatuses.map((ms) => (
                      <SelectItem key={ms.id} value={String(ms.id)}>
                        {ms.name.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="A short bio or profile description"
                  rows={4}
                  {...register("bio")}
                />
                {errors.bio && (
                  <p className="text-sm text-destructive">
                    {errors.bio.message}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Max 500 characters.
                </p>
              </div>

              {/* Error / Success messages */}
              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
              )}
              {successMessage && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  {successMessage}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Once you delete your account, there is no going back. Your profile
              will be hidden from other users. You can contact support to
              reactivate your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deleteError && (
              <p className="text-sm text-destructive mb-3">{deleteError}</p>
            )}
            <DeleteConfirmDialog
              isDeleting={isDeleting}
              onConfirm={handleDeleteAccount}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DeleteConfirmDialog({
  isDeleting,
  onConfirm,
}: {
  isDeleting: boolean;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="destructive"
        disabled={isDeleting}
        onClick={() => setOpen(true)}
      >
        {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Delete Account
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action will deactivate your account. Your profile will be
            hidden from other users, and your posts will be inaccessible. This
            cannot be undone from the app — you will need to contact support to
            reactivate.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
          >
            Delete My Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditProfileFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-[780px]">
        <CardHeader className="text-center">
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <Suspense fallback={<EditProfileFallback />}>
      <EditProfileInner />
    </Suspense>
  );
}
