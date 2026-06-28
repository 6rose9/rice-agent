"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { sendOtp, verifyOtp, resetPassword } from "@/lib/auth/actions";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";

function ForgotPasswordInner() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSendOtp() {
    setError("");
    if (!phone) {
      setError("Please enter your phone number.");
      return;
    }
    setLoading(true);
    const result = await sendOtp(phone);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Failed to send OTP.");
      return;
    }
    setOtpCode("");
    setOtpVerified(false);
    setStep(2);
    alert(`Your OTP code is: ${result.code}`);
  }

  async function handleVerifyOtp() {
    setError("");
    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }
    setLoading(true);
    const result = await verifyOtp(phone, otpCode);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "OTP verification failed.");
      return;
    }
    setOtpVerified(true);
    setStep(3);
  }

  async function handleResetPassword() {
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const result = await resetPassword(phone, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Failed to reset password.");
      return;
    }
    setSuccess(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <Image src="/logo.svg" alt="စပါးအောင်သွယ်" width={64} height={64} />
          </div>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {step === 1 && "Enter your phone number to get started"}
            {step === 2 && "Enter the OTP code sent to your phone"}
            {step === 3 && "Create a new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4 py-4">
              <ShieldCheck className="h-12 w-12 text-green-600 mx-auto" />
              <p className="text-sm">Your password has been reset successfully.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Step 1: Phone */}
              {step === 1 && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="09xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    onClick={handleSendOtp}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Send OTP
                  </Button>
                </div>
              )}

              {/* Step 2: OTP */}
              {step === 2 && (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otpCode}
                      onChange={setOtpCode}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleVerifyOtp}
                      disabled={loading || otpCode.length !== 6}
                    >
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Verify
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSendOtp}
                      disabled={loading}
                    >
                      Resend
                    </Button>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={() => { setStep(1); setError(""); }}
                  >
                    ← Change phone number
                  </Button>
                </div>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <ShieldCheck className="h-4 w-4" />
                    Phone verified
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 chars, 1 number, 1 special char"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-9"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm Password</Label>
                    <Input
                      id="confirm_password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleResetPassword}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Reset Password
                  </Button>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-3">
          <Link href="/login" className="text-sm text-primary hover:underline">
            ← Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

function ForgotPasswordFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="text-center">
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordFallback />}>
      <ForgotPasswordInner />
    </Suspense>
  );
}
