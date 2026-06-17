"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { FeedFilter } from "@/types";

interface FeedFilterProps {
  value: FeedFilter;
  onChange: (value: FeedFilter) => void;
  isAuthenticated?: boolean;
}

const filters: { value: FeedFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "buying", label: "Buying" },
  { value: "selling", label: "Selling" },
  { value: "following", label: "Following" },
];

export function FeedFilter({
  value,
  onChange,
  isAuthenticated = false,
}: FeedFilterProps) {
  return (
    <div className="sticky top-0 md:top-0 z-40 flex gap-1 px-4 py-2 overflow-x-auto no-scrollbar border-b bg-background">
      {filters.map((f) => {
        const isActive = value === f.value;
        return (
          <Button
            key={f.value}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            className={cn(
              "rounded-full h-8 px-3 text-xs font-medium whitespace-nowrap shrink-0",
              isActive && "bg-primary text-primary-foreground"
            )}
            onClick={() => onChange(f.value)}
          >
            {f.label}
          </Button>
        );
      })}
    </div>
  );
}
