"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Auth error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-xl font-semibold mb-2">Authentication error</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Something went wrong during authentication. Please try again.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
