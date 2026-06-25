"use client";

import Link from "next/link";
import { acceptConnectionRequest, declineConnectionRequest } from "@/lib/network/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROLE_LABELS } from "@/lib/constants";
import { useMarketStatuses } from "@/hooks/use-market-statuses";
import { useRegions } from "@/hooks/use-regions";
import type { Profile } from "@/types";
import { MapPin, Clock, Check, X, Loader2 } from "lucide-react";
import { useState } from "react";

interface InvitationCardProps {
  requestId: string;
  sender: Profile;
  created_at: string;
  onAccepted: () => void;
  onDeclined: () => void;
}

export function InvitationCard({
  requestId,
  sender,
  created_at,
  onAccepted,
  onDeclined,
}: InvitationCardProps) {
  const { labels, colors } = useMarketStatuses();
  const { getLocationLabel } = useRegions();
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    setLoading(true);
    const result = await acceptConnectionRequest(requestId);
    setLoading(false);
    if (result.success) {
      onAccepted();
    }
  }

  async function handleDecline() {
    setLoading(true);
    const result = await declineConnectionRequest(requestId);
    setLoading(false);
    if (result.success) {
      onDeclined();
    }
  }

  return (
    <div className="flex items-start gap-3 px-4 py-4 sm:px-6">
      <Link href={`/profile/${sender.username}`} className="shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={sender.avatar_url ?? undefined} alt={sender.full_name} />
          <AvatarFallback className="text-lg bg-accent">
            {sender.full_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/profile/${sender.username}`}
              className="text-sm font-semibold hover:text-primary hover:underline transition-colors"
            >
              {sender.full_name}
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
              <span>{ROLE_LABELS[sender.role as keyof typeof ROLE_LABELS]}</span>
              {getLocationLabel(sender) && (
                <>
                  <span>·</span>
                  <MapPin className="h-2.5 w-2.5" />
                  <span>{getLocationLabel(sender).split(",")[0]}</span>
                </>
              )}
            </p>
          </div>
        </div>
        {sender.market_status_id != null && labels[sender.market_status_id] && (
          <span
            className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={
              colors[sender.market_status_id]
                ? {
                    backgroundColor: `${colors[sender.market_status_id]}20`,
                    color: colors[sender.market_status_id],
                  }
                : undefined
            }
          >
            {labels[sender.market_status_id]}
          </span>
        )}
        <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          {new Date(created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
        <div className="flex gap-2 mt-2.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full text-xs"
            onClick={handleDecline}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <X className="h-3 w-3 mr-1" />
            )}
            Ignore
          </Button>
          <Button
            size="sm"
            className="h-8 rounded-full text-xs"
            onClick={handleAccept}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3 mr-1" />
            )}
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
