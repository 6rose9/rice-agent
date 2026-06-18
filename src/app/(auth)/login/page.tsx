"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { login } from "@/lib/auth/actions";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Loader2 } from "lucide-react";

function LoginFormInner() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/feed";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loginSchema as any) as any,
  });

  async function onSubmit(data: LoginInput) {
    const formData = new FormData();
    formData.append("phone", data.phone);
    formData.append("password", data.password);
    formData.append("redirect", redirect);

    const result = await login({ success: false }, formData);

    if (!result.success) {
      setError("root", { message: result.error || "Login failed. Please try again." });
      return;
    }

    window.location.href = result.redirect || redirect;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <Image src="/logo.svg" alt="စပါးအောင်သွယ်" width={64} height={64} />
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Sign in to your စပါးအောင်သွယ် account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="09xxxxxxxxx"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            {errors.root && (
              <p className="text-sm text-destructive">{errors.root.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={
                redirect !== "/feed"
                  ? `/register?redirect=${encodeURIComponent(redirect)}`
                  : "/register"
              }
              className="text-primary hover:underline"
            >
              Register
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

function LoginFormFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <Image src="/logo.svg" alt="စပါးအောင်သွယ်" width={64} height={64} />
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginFormInner />
    </Suspense>
  );
}
