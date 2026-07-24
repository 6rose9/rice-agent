"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserConnectedProfiles, getConnectionCount } from "@/lib/network/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketStatuses } from "@/hooks/use-market-statuses";
import { useRegions } from "@/hooks/use-regions";
import type { Profile } from "@/types";
import { Users, ArrowLeft, Loader2 } from "lucide-react";

// ── Skeleton ──────────────────────────────────────────────────────

function ConnectionSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
      <Skeleton className="h-11 w-11 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// ── Connection Row (view-only) ────────────────────────────────────

function ConnectionRow({
  profile,
  labels,
  colors,
  getLocationLabel,
}: {
  profile: Profile;
  labels: Record<number, string>;
  colors: Record<number, string>;
  getLocationLabel: (p: { region_id: number; township_id: number | null }) => string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-6 hover:bg-muted/50 transition-colors">
      <Link href={`/profile/${profile.username}`} className="shrink-0">
        <Avatar className="h-11 w-11">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
          <AvatarFallback className="text-sm bg-accent">
            {profile.full_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/profile/${profile.username}`}
          className="text-sm font-semibold hover:text-primary truncate block"
        >
          {profile.full_name}
        </Link>
        <p className="text-xs text-muted-foreground truncate">
          {profile.role}
          {getLocationLabel(profile) && ` · ${getLocationLabel(profile).split(",")[0]}`}
        </p>
        <div className="mt-0.5 h-4">
          {profile.market_status_id != null && labels[profile.market_status_id] && (
            <span
              className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={
                colors[profile.market_status_id]
                  ? {
                      backgroundColor: `${colors[profile.market_status_id]}20`,
                      color: colors[profile.market_status_id],
                    }
                  : undefined
              }
            >
              {labels[profile.market_status_id]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page Content ──────────────────────────────────────────────────

function UserConnectionsContent() {
  const params = useParams();
  const username = params.username as string;
  const { labels, colors } = useMarketStatuses();
  const { getLocationLabel } = useRegions();

  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileOwner, setProfileOwner] = useState<Profile | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch the profile to get their ID
      const supabase = createClient();
      const { data: ownerData } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (!ownerData) {
        setProfileOwner(null);
        setProfiles([]);
        setLoading(false);
        return;
      }

      const owner = ownerData as Profile;
      setProfileOwner(owner);

      const [connected] = await Promise.all([
        getUserConnectedProfiles(owner.id),
      ]);
      setProfiles(connected);
    } catch {
      console.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not found state
  if (!profileOwner) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Avatar className="h-20 w-20 mb-4">
          <AvatarFallback className="text-2xl bg-accent">?</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold mb-2">Profile not found</h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          The profile you&apos;re looking for doesn&apos;t exist or may have
          been removed.
        </p>
        <Link href="/feed">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
            Back to Feed
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 flex items-center gap-3">
          <Link
            href={`/profile/${username}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">
              {profileOwner.full_name.split(" ")[0]}&apos;s Connections
            </h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${profiles.length} connection${profiles.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <ConnectionSkeleton key={i} />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No connections yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              {profileOwner.full_name.split(" ")[0]} hasn&apos;t connected with anyone yet.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {profiles.map((profile) => (
              <ConnectionRow
                key={profile.id}
                profile={profile}
                labels={labels}
                colors={colors}
                getLocationLabel={getLocationLabel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserConnectionsPage() {
  return <UserConnectionsContent />;
}
