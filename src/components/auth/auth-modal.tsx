"use client";

import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { login, register as registerAction } from "@/lib/auth/actions";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validations/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { useRegions } from "@/hooks/use-regions";
import { Loader2 } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: string;
  onSuccess: () => void;
}

export function AuthModal({
  open,
  onOpenChange,
  action,
  onSuccess,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [serverError, setServerError] = useState("");
  const { regions, getTownshipsForRegion } = useRegions();

  // ── Login Form ──
  const loginForm = useForm<LoginInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loginSchema as any) as any,
    defaultValues: { phone: "", password: "" },
  });

  // ── Register Form ──
  const registerForm = useForm<RegisterInput>({
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

  const watchedRegionId = registerForm.watch("region_id");
  const watchedTownshipId = registerForm.watch("township_id");

  // Townships filtered by selected region
  const regTownships = useMemo(() => {
    if (!watchedRegionId || watchedRegionId < 1) return [];
    return getTownshipsForRegion(watchedRegionId);
  }, [watchedRegionId, getTownshipsForRegion]);

  // Reset township when region changes
  function handleRegRegionChange(value: string | null) {
    registerForm.setValue("region_id", Number(value ?? 0), { shouldValidate: true });
    registerForm.setValue("township_id", 0, { shouldValidate: false });
  }

  // Reset all forms and errors
  const resetAll = useCallback(() => {
    loginForm.reset();
    registerForm.reset();
    setServerError("");
  }, [loginForm, registerForm]);

  // Reset on dialog open state change
  function handleOpenChange(open: boolean) {
    if (!open) resetAll();
    onOpenChange(open);
  }

  // Reset when switching tabs
  function handleTabChange(tab: string) {
    setActiveTab(tab as "login" | "register");
    setServerError("");
  }

  // ── Login Submit ──
  async function onLoginSubmit(data: LoginInput) {
    setServerError("");

    const formData = new FormData();
    formData.append("phone", data.phone);
    formData.append("password", data.password);

    const result = await login(null, formData);

    if (!result.success) {
      setServerError(result.error || "Login failed. Please try again.");
      return;
    }

    resetAll();
    onSuccess();
  }

  // ── Register Submit ──
  async function onRegisterSubmit(data: RegisterInput) {
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

    const result = await registerAction(null, formData);

    if (!result.success) {
      setServerError(result.error || "Registration failed. Please try again.");
      return;
    }

    resetAll();
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {action ? `Sign in to ${action}` : "Welcome to စပါးအောင်သွယ်"}
          </DialogTitle>
          <DialogDescription className="text-center">
            Connect with Myanmar&apos;s rice community.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* ── Login Tab ── */}
          <TabsContent value="login">
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-4 pt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="modal-login-phone">Phone Number</Label>
                <Input
                  id="modal-login-phone"
                  type="tel"
                  placeholder="09xxxxxxxxx"
                  {...loginForm.register("phone")}
                />
                {loginForm.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-login-password">Password</Label>
                <Input
                  id="modal-login-password"
                  type="password"
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Login
              </Button>
            </form>
          </TabsContent>

          {/* ── Register Tab ── */}
          <TabsContent value="register">
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="space-y-4 pt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="modal-reg-phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-reg-phone"
                  type="tel"
                  placeholder="09xxxxxxxxx"
                  {...registerForm.register("phone")}
                />
                {registerForm.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.phone.message}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Myanmar phone format: 09xxxxxxxxx
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-reg-name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-reg-name"
                  type="text"
                  placeholder="U Mg Mg"
                  {...registerForm.register("full_name")}
                />
                {registerForm.formState.errors.full_name && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.full_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-reg-email">Email</Label>
                <Input
                  id="modal-reg-email"
                  type="email"
                  placeholder="you@example.com"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-reg-role">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={registerForm.getValues("role") || ""}
                  onValueChange={(v) =>
                    registerForm.setValue(
                      "role",
                      (v ?? "general_user") as RegisterInput["role"],
                      { shouldValidate: true }
                    )
                  }
                >
                  <SelectTrigger id="modal-reg-role" className="w-full">
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
                {registerForm.formState.errors.role && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.role.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-reg-region">
                  Region <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={
                    watchedRegionId > 0 ? String(watchedRegionId) : ""
                  }
                  onValueChange={handleRegRegionChange}
                >
                  <SelectTrigger id="modal-reg-region" className="w-full">
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
                {registerForm.formState.errors.region_id && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.region_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-reg-township">
                  Township <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watchedTownshipId > 0 ? String(watchedTownshipId) : ""}
                  onValueChange={(v) =>
                    registerForm.setValue("township_id", Number(v ?? 0), {
                      shouldValidate: true,
                    })
                  }
                  disabled={!watchedRegionId || watchedRegionId < 1}
                >
                  <SelectTrigger id="modal-reg-township" className="w-full">
                    {watchedTownshipId > 0
                      ? regTownships.find((t) => t.id === watchedTownshipId)?.name.en
                      : watchedRegionId && watchedRegionId > 0
                        ? "Select township"
                        : "Select a region first"}
                  </SelectTrigger>
                  <SelectContent>
                    {regTownships.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {registerForm.formState.errors.township_id && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.township_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-reg-password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-reg-password"
                  type="password"
                  placeholder="Min 6 characters"
                  {...registerForm.register("password")}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-reg-confirm-password">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-reg-confirm-password"
                  type="password"
                  placeholder="Re-enter your password"
                  {...registerForm.register("confirm_password")}
                />
                {registerForm.formState.errors.confirm_password && (
                  <p className="text-sm text-destructive">
                    {registerForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={registerForm.formState.isSubmitting}
              >
                {registerForm.formState.isSubmitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
