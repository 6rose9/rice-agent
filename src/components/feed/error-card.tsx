"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorCard({
  message = "Something went wrong",
  onRetry,
}: ErrorCardProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="bg-destructive/10 rounded-full p-4 mb-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-base font-semibold mb-1">{message}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Please try again or check your connection.
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
