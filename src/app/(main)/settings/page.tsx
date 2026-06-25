"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { deleteAccount, updatePrivacySettings } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2,
  LogOut,
  User,
  UserCog,
  Settings,
  AlertTriangle,
  ChevronRight,
  Bookmark,
  Shield,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Privacy settings state
  const [phoneVisibility, setPhoneVisibility] = useState("private");
  const [emailVisibility, setEmailVisibility] = useState("private");
  const [isPending, startTransition] = useTransition();
  const [privacySaved, setPrivacySaved] = useState(false);
  const [privacyError, setPrivacyError] = useState("");

  // Sync privacy state from profile data when it loads or changes
  useEffect(() => {
    if (user?.profile) {
      const p = user.profile as Record<string, unknown>;
      setPhoneVisibility((p.phone_visibility as string) || "private");
      setEmailVisibility((p.email_visibility as string) || "private");
    }
  }, [user?.profile]);

  // Show sign-in gate instead of redirecting
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <SignInGate
        icon={Settings}
        title="Sign in to access settings"
        description="Manage your account, profile, and preferences."
        redirectTo="/settings"
      />
    );
  }

  const profile = user.profile;

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    router.push("/feed");
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

  async function handleSavePrivacy() {
    setPrivacySaved(false);
    setPrivacyError("");

    const formData = new FormData();
    formData.set("phone_visibility", phoneVisibility);
    formData.set("email_visibility", emailVisibility);

    startTransition(async () => {
      const result = await updatePrivacySettings(null, formData);
      if (result.success) {
        setPrivacySaved(true);
        // Auto-hide success message after 3 seconds
        setTimeout(() => setPrivacySaved(false), 3000);
      } else {
        setPrivacyError(result.error || "Failed to save privacy settings.");
      }
    });
  }

  const VISIBILITY_OPTIONS = [
    { value: "public", label: "Everyone", description: "Visible to all users" },
    { value: "followers", label: "Followers Only", description: "Only your followers can see" },
    { value: "private", label: "Only Me", description: "Hidden from everyone else" },
  ];

  return (
    <div className="max-w-[780px] p-4 sm:p-6 space-y-6">
      {/* Profile Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-xl bg-accent">
                {profile.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg">{profile.full_name}</h2>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account information and profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <Link
            href={`/profile/${profile.username}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">View Profile</p>
                <p className="text-xs text-muted-foreground">
                  See how others see your profile.
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link
            href="/profile/edit"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <UserCog className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Edit Profile</p>
                <p className="text-xs text-muted-foreground">
                  Update your name, role, location, and more.
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link
            href="/saved"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Saved Posts</p>
                <p className="text-xs text-muted-foreground">
                  View your bookmarked posts and listings.
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium">Sign Out</p>
                <p className="text-xs text-muted-foreground">
                  Sign out of your account on this device.
                </p>
              </div>
            </div>
            {isSigningOut && <Loader2 className="h-4 w-4 animate-spin" />}
          </button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control who can see your contact information on your profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Phone Visibility */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Phone Number</label>
            </div>
            <Select
              value={phoneVisibility}
              onValueChange={(v) => {
                setPhoneVisibility(v);
                setPrivacySaved(false);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email Visibility */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Email Address</label>
            </div>
            <Select
              value={emailVisibility}
              onValueChange={(v) => {
                setEmailVisibility(v);
                setPrivacySaved(false);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Feedback */}
          {privacyError && (
            <p className="text-sm text-destructive">{privacyError}</p>
          )}
          {privacySaved && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Privacy settings saved.
            </p>
          )}

          <Button
            onClick={handleSavePrivacy}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Privacy Settings
          </Button>
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
            Irreversible actions for your account. Deleting your account will
            hide your profile from other users. Contact support to reactivate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deleteError && (
            <p className="text-sm text-destructive mb-3">{deleteError}</p>
          )}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => setDeleteOpen(true)}
            >
              {isDeleting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete Account
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action will deactivate your account. Your profile will be
                  hidden from other users, and your posts will be inaccessible.
                  This cannot be undone from the app — you will need to contact
                  support to reactivate.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDeleteOpen(false);
                    handleDeleteAccount();
                  }}
                >
                  Delete My Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
