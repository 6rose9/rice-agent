"use client";

import { useState, useCallback, useMemo } from "react";
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
import { useAuth } from "@/components/auth/auth-provider";
import { regionTownships, regionKeys, roleLabels } from "@/lib/mock-data";
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
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState("");
  const [regRegion, setRegRegion] = useState("");
  const [regTownship, setRegTownship] = useState("");

  // Townships filtered by selected region
  const regTownships = useMemo(() => {
    if (!regRegion) return [];
    return regionTownships[regRegion]?.townships || [];
  }, [regRegion]);

  const resetForms = useCallback(() => {
    setLoginPhone("");
    setLoginPassword("");
    setRegPhone("");
    setRegPassword("");
    setRegConfirmPassword("");
    setRegFullName("");
    setRegEmail("");
    setRegRole("");
    setRegRegion("");
    setRegTownship("");
    setError("");
  }, []);

  function handleRegionChange(value: string | null) {
    setRegRegion(value ?? "");
    setRegTownship("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginPhone || !loginPassword) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await signIn(loginPhone, loginPassword);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      resetForms();
      onSuccess();
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regPhone || !regPassword || !regFullName) {
      setError("Phone, password, and name are required.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const regionLabel = regRegion ? regionTownships[regRegion]?.label : undefined;
    const { error } = await signUp(
      regPhone,
      regPassword,
      regFullName,
      regEmail || undefined,
      regRole || undefined,
      regionLabel,
      regTownship || undefined
    );
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      resetForms();
      onSuccess();
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetForms();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {action ? `Sign in to ${action}` : "Welcome to စပါးအောင်သွယ်"}
          </DialogTitle>
          <DialogDescription className="text-center">
            Connect with Myanmar&apos;s rice community.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as "login" | "register");
            setError("");
          }}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* Login form */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="login-phone">Phone Number</Label>
                <Input
                  id="login-phone"
                  type="tel"
                  placeholder="09xxxxxxxxx"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Login
              </Button>
            </form>
          </TabsContent>

          {/* Register form */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="reg-phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="09xxxxxxxxx"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">
                  Myanmar phone format: 09xxxxxxxxx
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="U Mg Mg"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">
                  Email <span className="text-muted-foreground"></span>
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-role">Profile</Label>
                <Select value={regRole} onValueChange={(v) => setRegRole(v ?? "")}>
                  <SelectTrigger id="reg-role" className="w-full">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-region">Region</Label>
                <Select value={regRegion} onValueChange={handleRegionChange}>
                  <SelectTrigger id="reg-region" className="w-full">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionKeys.map((key) => (
                      <SelectItem key={key} value={key}>
                        {regionTownships[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-township">Township</Label>
                <Select
                  value={regTownship}
                  onValueChange={(v) => setRegTownship(v ?? "")}
                  disabled={!regRegion}
                >
                  <SelectTrigger id="reg-township" className="w-full">
                    <SelectValue
                      placeholder={
                        regRegion ? "Select township" : "Select a region first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {regTownships.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-confirm-password">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-confirm-password"
                  type="password"
                  placeholder="Re-enter your password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
