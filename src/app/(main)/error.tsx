"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RiceSeedIcon } from "@/components/icons/rice-seed";
import { AlertTriangle } from "lucide-react";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="h-20 w-20 rounded-full bg-destructive/10 ring-1 ring-destructive/20 flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive absolute" />
        <RiceSeedIcon size={28} className="text-destructive/10 translate-x-3 translate-y-3" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight mb-2">Something went wrong</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
        An unexpected error occurred while loading this page.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
