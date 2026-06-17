"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { AuthProvider, useAuth } from "@/components/auth/auth-provider";
import { Loader2 } from "lucide-react";

function LoginFormInner() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/feed";
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || !password) {
      setError("Please enter your phone number and password.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await signIn(phone, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push(redirect);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="text-center">
          <div className="text-3xl mb-2">🍚</div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Sign in to your စပါးအောင်သွယ် account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="09xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
          <div className="text-3xl mb-2">🍚</div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoginFormFallback />}>
        <LoginFormInner />
      </Suspense>
    </AuthProvider>
  );
}
