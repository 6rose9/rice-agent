"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RightRail } from "@/components/layout/right-rail";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABELS } from "@/lib/constants";
import {
  getConnectedProfiles,
  getConnectionCount,
  getFollowerCount,
  getFollowingCount,
  getPendingRequests,
  removeConnection,
} from "@/lib/network/actions";
import { useMarketStatuses } from "@/hooks/use-market-statuses";
import { useRegions } from "@/hooks/use-regions";
import type { Profile } from "@/types";
import { Users, ArrowLeft, UserMinus, Loader2 } from "lucide-react";

// ── Skeleton ──────────────────────────────────────────────────────

function ConnectionSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
      <Skeleton className="h-11 w-11 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-20 rounded-full shrink-0" />
    </div>
  );
}

// ── Connection Row ────────────────────────────────────────────────

function ConnectionRow({
  profile,
  labels,
  colors,
  getLocationLabel,
  onRemoved,
}: {
  profile: Profile;
  labels: Record<number, string>;
  colors: Record<number, string>;
  getLocationLabel: (p: { region_id: number; township_id: number | null }) => string;
  onRemoved: () => void;
}) {
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    if (removing) return;
    setRemoving(true);
    const result = await removeConnection(profile.id);
    if (result.success) {
      onRemoved();
    } else {
      setRemoving(false);
    }
  }

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
          {ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS]}
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
      <Button
        variant="outline"
        size="sm"
        className="h-8 rounded-full text-xs text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
        onClick={handleRemove}
        disabled={removing}
      >
        {removing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            <UserMinus className="h-3.5 w-3.5 mr-1" />
            Remove
          </>
        )}
      </Button>
    </div>
  );
}

// ── Page Content ──────────────────────────────────────────────────

function ConnectionsContent() {
  const { isAuthenticated, user: currentUser } = useAuth();
  const { labels, colors } = useMarketStatuses();
  const { getLocationLabel } = useRegions();

  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState({ connections: 0, followers: 0, following: 0, pending: 0 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [connected, connCount, followerCount, followingCount, pending] =
        await Promise.all([
          getConnectedProfiles(),
          currentUser?.profile.id ? getConnectionCount(currentUser.profile.id) : 0,
          currentUser?.profile.id ? getFollowerCount(currentUser.profile.id) : 0,
          currentUser?.profile.id ? getFollowingCount(currentUser.profile.id) : 0,
          getPendingRequests(),
        ]);
      setProfiles(connected);
      setStats({ connections: connCount, followers: followerCount, following: followingCount, pending: pending.length });
    } catch {
      console.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleRemoved(profileId: string) {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
  }

  if (!isAuthenticated) {
    return (
      <SignInGate
        icon={Users}
        title="Sign in to see your connections"
        description="Connect with rice traders, farmers, millers, and agents across Myanmar."
        redirectTo="/mynetwork/connections"
      />
    );
  }

  return (
    <div className="flex">
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 flex items-center gap-3">
          <Link href="/mynetwork" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Connections</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${profiles.length} connections`}
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
              Start connecting with people and they will appear here.
            </p>
            <Link href="/mynetwork">
              <Button variant="outline" className="mt-4">Find People</Button>
            </Link>
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
                onRemoved={() => handleRemoved(profile.id)}
              />
            ))}
          </div>
        )}
      </div>

      <RightRail
        variant="network"
        networkStats={{
          connections: stats.connections,
          followers: stats.followers,
          following: stats.following,
          pending: stats.pending,
        }}
      />
    </div>
  );
}

export default function ConnectionsPage() {
  return <ConnectionsContent />;
}
