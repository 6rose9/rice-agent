"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignInGateProps {
  /** Lucide icon to display */
  icon?: LucideIcon;
  /** Main heading */
  title: string;
  /** Subtitle / description */
  description: string;
  /** Redirect path after login, e.g. "/mynetwork" */
  redirectTo: string;
  /** Optional extra class for the outer wrapper */
  className?: string;
}

export function SignInGate({
  icon: Icon = LogIn,
  title,
  description,
  redirectTo,
  className = "",
}: SignInGateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center max-w-[780px] ${className}`}>
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">{description}</p>
      <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`}>
        <Button>Sign In</Button>
      </Link>
    </div>
  );
}
