"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { AuthProvider, useAuth } from "@/components/auth/auth-provider";
import { regionTownships, regionKeys, roleLabels } from "@/lib/mock-data";
import { Loader2 } from "lucide-react";

function RegisterFormInner() {
  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/feed";
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [region, setRegion] = useState("");
  const [township, setTownship] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profile, setProfile] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<number>(1);

  // Townships filtered by selected region
  const townships = useMemo(() => {
    if (!region) return [];
    return regionTownships[region]?.townships || [];
  }, [region]);

  // Reset township when region changes
  function handleRegionChange(value: string | null) {
    setRegion(value ?? "");
    setTownship("");
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
        } catch {}
      }
    };
  }, [profileImagePreview]);

  function handleNext() {
    setError("");
    if (step === 1) {
      if (!phone || !fullName) {
        setError("Phone and full name are required to continue.");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!role) {
        setError("Please choose a role to continue.");
        return;
      }
      setStep(3);
      return;
    }
  }

  function handleBack() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Only submit on final step
    if (step !== 3) {
      handleNext();
      return;
    }
    if (!phone || !password || !fullName) {
      setError("Phone, name, and password are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const regionLabel = region ? regionTownships[region]?.label : undefined;
    const result = await signUp(
      phone,
      password,
      fullName,
      email || undefined,
      role || undefined,
      regionLabel,
      township || undefined,
    );
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push(redirect);
    }
  }

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
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="U Mg Mg"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="09xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Myanmar phone format required (e.g. 09123456789)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={region}
                    onValueChange={handleRegionChange}
                  >
                    <SelectTrigger
                      id="region"
                      className="w-full"
                    >
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regionKeys.map((key) => (
                        <SelectItem
                          key={key}
                          value={key}
                        >
                          {regionTownships[key].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="township">Township</Label>
                  <Select
                    value={township}
                    onValueChange={(v) => setTownship(v ?? "")}
                    disabled={!region}
                  >
                    <SelectTrigger
                      id="township"
                      className="w-full"
                    >
                      <SelectValue
                        placeholder={
                          region ? "Select township" : "Select a region first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {townships.map((t) => (
                        <SelectItem
                          key={t}
                          value={t}
                        >
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}

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
                        {fullName ? fullName.charAt(0).toUpperCase() : "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <label
                      htmlFor="profile-image"
                      className="cursor-pointer"
                    >
                      <Button type="button">Upload Image</Button>
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
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v ?? "")}
                  >
                    <SelectTrigger
                      id="role"
                      className="w-full"
                    >
                      <SelectValue placeholder="Choose your profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem
                          key={value}
                          value={value}
                        >
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="A short bio or profile description"
                    value={profile}
                    onChange={(e) => setProfile(e.target.value)}
                  />
                </div>
              </div>
            )}

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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    Confirm Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex items-center justify-between">
              <div>
                {step > 1 ? (
                  <Button
                    type="button"
                    variant={"secondary"}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}
              </div>
              <div className="flex items-center gap-2">
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading && (
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
    <AuthProvider>
      <Suspense fallback={<RegisterFormFallback />}>
        <RegisterFormInner />
      </Suspense>
    </AuthProvider>
  );
}
