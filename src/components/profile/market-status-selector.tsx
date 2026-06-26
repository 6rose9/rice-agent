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
import { useMarketStatuses } from "@/hooks/use-market-statuses";
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
  const { statuses, labels, colors } = useMarketStatuses();

  const currentLabel = currentStatusId ? labels[currentStatusId] : null;
  const currentColor = currentStatusId ? colors[currentStatusId] : null;

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
        className="text-xs"
        style={
          currentColor
            ? {
                backgroundColor: `${currentColor}20`,
                color: currentColor,
                borderColor: `${currentColor}40`,
              }
            : undefined
        }
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
          !currentLabel && "text-muted-foreground border-dashed"
        )}
        style={
          currentColor && currentLabel
            ? {
                backgroundColor: `${currentColor}20`,
                color: currentColor,
                borderColor: `${currentColor}40`,
              }
            : undefined
        }
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
        {statuses.map((status) => {
          const color = status.color;
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
                className="flex-1 flex items-center gap-2"
                style={color ? { color } : undefined}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full border"
                  style={
                    color
                      ? {
                          backgroundColor: `${color}30`,
                          borderColor: `${color}60`,
                        }
                      : undefined
                  }
                />
                {(status.name as { en: string }).en}
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
