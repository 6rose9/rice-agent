"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";
import {
  mockMarketStatuses,
  marketStatusLabels,
  marketStatusColors,
} from "@/lib/mock-data";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketStatusSelectorProps {
  currentStatusId: number | null;
  isOwnProfile: boolean;
  onStatusChange?: (newStatusId: number | null) => void;
}

export function MarketStatusSelector({
  currentStatusId,
  isOwnProfile,
  onStatusChange,
}: MarketStatusSelectorProps) {
  const [saving, setSaving] = useState(false);
  const { refreshProfile } = useAuth();

  const currentLabel = currentStatusId
    ? marketStatusLabels[currentStatusId]
    : null;
  const currentColor = currentStatusId
    ? marketStatusColors[currentStatusId]
    : null;

  async function handleSelect(statusId: number | null) {
    if (!isOwnProfile) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ market_status_id: statusId })
        .eq("id", user.id);

      if (error) {
        console.error("Failed to update market status:", error);
        return;
      }

      await refreshProfile();
      onStatusChange?.(statusId);
    } catch (err) {
      console.error("Failed to update market status:", err);
    } finally {
      setSaving(false);
    }
  }

  // Read-only badge for other profiles
  if (!isOwnProfile) {
    if (!currentLabel) return null;
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-xs",
          currentColor?.bg,
          currentColor?.text,
          currentColor?.border
        )}
      >
        {currentLabel}
      </Badge>
    );
  }

  // Editable selector for own profile
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border cursor-pointer",
          "hover:bg-accent transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          currentLabel
            ? cn(currentColor?.bg, currentColor?.text, currentColor?.border)
            : "text-muted-foreground border-dashed"
        )}
        disabled={saving}
      >
        {saving ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : currentLabel ? (
          <>
            {currentLabel}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </>
        ) : (
          <>
            Set status
            <ChevronDown className="h-3 w-3 opacity-50" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Market Status
          </p>
        </div>
        {mockMarketStatuses.map((status) => {
          const colors = marketStatusColors[status.id];
          const isSelected = currentStatusId === status.id;
          return (
            <DropdownMenuItem
              key={status.id}
              onClick={() => handleSelect(isSelected ? null : status.id)}
              disabled={saving}
              className={cn(
                "flex items-center gap-2",
                isSelected && "bg-accent"
              )}
            >
              <div
                className={cn(
                  "flex-1 flex items-center gap-2",
                  colors?.text
                )}
              >
                <span
                  className={cn(
                    "inline-block w-2 h-2 rounded-full",
                    colors?.bg,
                    colors?.border,
                    "border"
                  )}
                />
                {status.name.en}
              </div>
              {isSelected && <Check className="h-3 w-3 text-primary" />}
            </DropdownMenuItem>
          );
        })}
        {currentStatusId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleSelect(null)}
              disabled={saving}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <X className="h-3 w-3" />
              Clear status
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
