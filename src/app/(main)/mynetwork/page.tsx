"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RightRail } from "@/components/layout/right-rail";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABELS } from "@/lib/constants";
import {
  getSuggestedProfilesWithStatus,
  getPendingRequests,
  getPendingSentRequests,
  declineConnectionRequest,
  getConnectionCount,
  getFollowerCount,
  getFollowingCount,
  type ConnectionRequestRow,
  type SentRequestRow,
  type ConnectionStatus,
} from "@/lib/network/actions";
import { ConnectButton } from "@/components/network/connect-button";
import { InvitationCard } from "@/components/network/invitation-card";
import { useMarketStatuses } from "@/hooks/use-market-statuses";
import { useRegions } from "@/hooks/use-regions";
import type { Profile } from "@/types";
import {
  Users,
  UserPlus,
  MapPin,
  RefreshCw,
  Mail,
  Clock,
  Loader2,
} from "lucide-react";

// ── Skeletons ─────────────────────────────────────────────────────

function InvitationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-4 sm:px-6">
      <Skeleton className="h-12 w-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SuggestionSkeleton() {
  return (
    <Card className="overflow-hidden border">
      <div className="h-10 sm:h-14 bg-muted" />
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="flex justify-center -mt-6 sm:-mt-7 mb-2">
          <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-full ring-2 ring-card" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-12 mt-1" />
          <Skeleton className="h-8 w-full rounded-full mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Content ──────────────────────────────────────────────────

function NetworkContent() {
  const { isAuthenticated, user: currentUser } = useAuth();
  const { labels, colors } = useMarketStatuses();
  const { getLocationLabel } = useRegions();

  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<
    {
      profile: Profile;
      connectionStatus: ConnectionStatus;
      isFollowing: boolean;
    }[]
  >([]);
  const [invitations, setInvitations] = useState<ConnectionRequestRow[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequestRow[]>([]);
  const [stats, setStats] = useState({
    connections: 0,
    followers: 0,
    following: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "invitations" | "pending" | "suggestions"
  >("suggestions");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        suggested,
        pending,
        sent,
        connCount,
        followerCount,
        followingCount,
      ] = await Promise.all([
        getSuggestedProfilesWithStatus(12),
        getPendingRequests(),
        getPendingSentRequests(),
        currentUser?.profile.id
          ? getConnectionCount(currentUser.profile.id)
          : 0,
        currentUser?.profile.id ? getFollowerCount(currentUser.profile.id) : 0,
        currentUser?.profile.id ? getFollowingCount(currentUser.profile.id) : 0,
      ]);
      setSuggestions(suggested);
      setInvitations(pending);
      setSentRequests(sent);
      setStats({
        connections: connCount,
        followers: followerCount,
        following: followingCount,
      });

      // Auto-switch to invitations tab if there are pending requests
      if (pending.length > 0) {
        setActiveTab("invitations");
      }
    } catch {
      setError("Failed to load network data.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleInvitationAccepted(requestId: string) {
    setInvitations((prev) => prev.filter((r) => r.id !== requestId));
    setStats((prev) => ({ ...prev, connections: prev.connections + 1 }));
  }

  function handleInvitationDeclined(requestId: string) {
    setInvitations((prev) => prev.filter((r) => r.id !== requestId));
  }

  function handleSuggestionStatusChange(
    profileId: string,
    newStatus: ConnectionStatus,
  ) {
    setSuggestions((prev) => {
      if (newStatus === "connected") {
        // Remove connected users from suggestions
        return prev.filter((s) => s.profile.id !== profileId);
      }
      return prev.map((s) =>
        s.profile.id === profileId ? { ...s, connectionStatus: newStatus } : s,
      );
    });
  }

  async function handleWithdrawRequest(requestId: string) {
    const result = await declineConnectionRequest(requestId);
    if (result.success) {
      setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
  }

  if (!isAuthenticated) {
    return (
      <SignInGate
        icon={Users}
        title="Sign in to manage your network"
        description="Connect with rice traders, farmers, millers, and agents across Myanmar."
        redirectTo="/mynetwork"
      />
    );
  }

  const pendingCount = invitations.length;

  return (
    <div className="flex">
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <h1 className="text-xl font-bold">My Network</h1>
        </div>

        {/* Stats links (mobile only - right sidebar shows this on desktop) */}
        <div className="lg:hidden px-4 pb-4 sm:px-6 flex items-center gap-3">
          <Link
            href="/mynetwork/connections"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="font-semibold text-sm">{stats.connections}</span>
            <span className="text-sm text-muted-foreground">Connections</span>
          </Link>
          <Link
            href="/mynetwork/following"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="font-semibold text-sm">{stats.following}</span>
            <span className="text-sm text-muted-foreground">Following</span>
          </Link>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden flex border-b overflow-x-auto no-scrollbar">
          <button
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === "invitations" ? "text-primary border-b-2 border-primary" : "hover:text-primary"}`}
            onClick={() => setActiveTab("invitations")}
          >
            Invitations
            {pendingCount > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({pendingCount})
              </span>
            )}
          </button>
          {sentRequests.length > 0 && (
            <button
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === "pending" ? "text-primary border-b-2 border-primary" : "hover:text-primary"}`}
              onClick={() => setActiveTab("pending")}
            >
              Pending
              <span className="ml-1 text-xs text-muted-foreground">
                ({sentRequests.length})
              </span>
            </button>
          )}
          <button
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === "suggestions" ? "text-primary border-b-2 border-primary" : "hover:text-primary"}`}
            onClick={() => setActiveTab("suggestions")}
          >
            People You May Know
          </button>
        </div>

        {/* INVITATIONS SECTION */}
        {(activeTab === "invitations" || pendingCount > 0) && (
          <section
            id="invitations"
            className={activeTab !== "invitations" ? "hidden md:block" : ""}
          >
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <h2 className="text-base font-semibold flex items-center gap-2">
                {!loading && pendingCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs h-5"
                  >
                    {pendingCount} new
                  </Badge>
                )}
              </h2>
            </div>

            {loading ? (
              <div className="divide-y">
                <InvitationSkeleton />
                <InvitationSkeleton />
                <InvitationSkeleton />
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">No pending invitations</p>
                <p className="text-xs text-muted-foreground mt-1">
                  All caught up! Connection requests you receive will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {invitations.map((inv) => (
                  <InvitationCard
                    key={inv.id}
                    requestId={inv.id}
                    sender={inv.sender}
                    created_at={inv.created_at}
                    onAccepted={() => handleInvitationAccepted(inv.id)}
                    onDeclined={() => handleInvitationDeclined(inv.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* PENDING SENT REQUESTS SECTION */}
        {!loading && sentRequests.length > 0 && (
          <section
            id="pending-requests"
            className={`py-4 sm:py-5 ${activeTab !== "pending" ? "hidden md:block" : ""}`}
          >
            <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Requests
                <Badge
                  variant="secondary"
                  className="text-xs h-5"
                >
                  {sentRequests.length}
                </Badge>
              </h2>
            </div>
            <div className="divide-y">
              {sentRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 px-4 py-3 sm:px-6 hover:bg-muted/50 transition-colors"
                >
                  <Link
                    href={`/profile/${req.receiver.username}`}
                    className="shrink-0"
                  >
                    <Avatar className="h-11 w-11">
                      <AvatarImage
                        src={req.receiver.avatar_url ?? undefined}
                        alt={req.receiver.full_name}
                      />
                      <AvatarFallback className="text-sm bg-accent">
                        {req.receiver.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/profile/${req.receiver.username}`}
                      className="text-sm font-semibold hover:text-primary truncate block"
                    >
                      {req.receiver.full_name}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">
                      {
                        ROLE_LABELS[
                          req.receiver.role as keyof typeof ROLE_LABELS
                        ]
                      }
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      Sent{" "}
                      {new Date(req.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full text-xs shrink-0"
                    onClick={() => handleWithdrawRequest(req.id)}
                  >
                    Withdraw
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PEOPLE YOU MAY KNOW SECTION */}
        <section
          id="people-you-may-know"
          className={`py-4 sm:py-5 ${activeTab !== "suggestions" ? "hidden md:block" : ""}`}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
            {/* display none on mobile */}
            <h2 className="text-base font-semibold flex items-center gap-2 hidden md:flex">
              <Users className="h-4 w-4" />
              People You May Know
            </h2>
          </div>

          {error && (
            <div className="px-4 sm:px-6 mb-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={loadData}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 sm:px-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SuggestionSkeleton key={i} />
                ))
              : suggestions.map((item) => (
                  <SuggestionCard
                    key={item.profile.id}
                    profile={item.profile}
                    labels={labels}
                    colors={colors}
                    getLocationLabel={getLocationLabel}
                    connectionStatus={item.connectionStatus}
                    onStatusChange={(status) =>
                      handleSuggestionStatusChange(item.profile.id, status)
                    }
                  />
                ))}
          </div>

          {!loading && !error && suggestions.length === 0 && (
            <div className="text-center py-12 px-4">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">No suggestions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                As more people join, they will appear here.
              </p>
            </div>
          )}
        </section>
      </div>

      <RightRail
        variant="network"
        networkStats={{
          connections: stats.connections,
          followers: stats.followers,
          following: stats.following,
          pending: pendingCount,
        }}
      />
    </div>
  );
}

// ── Suggestion Card ───────────────────────────────────────────────

function SuggestionCard({
  profile,
  labels,
  colors,
  getLocationLabel,
  connectionStatus,
  onStatusChange,
}: {
  profile: Profile;
  labels: Record<number, string>;
  colors: Record<number, string>;
  getLocationLabel: (p: {
    region_id: number;
    township_id: number | null;
  }) => string;
  connectionStatus: ConnectionStatus;
  onStatusChange?: (status: ConnectionStatus) => void;
}) {
  return (
    <Card className="overflow-hidden border hover:shadow-sm transition-shadow h-full pt-0">
      <Link
        href={`/profile/${profile.username}`}
        className="block"
      >
        <div className="h-10 sm:h-14 bg-gradient-to-r from-emerald-100 to-green-50 dark:from-emerald-900 dark:to-green-950">
          {profile.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.cover_url}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="flex justify-center -mt-6 sm:-mt-7 mb-2">
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-card">
              <AvatarImage
                src={profile.avatar_url ?? undefined}
                alt={profile.full_name}
              />
              <AvatarFallback className="text-base sm:text-lg bg-accent">
                {profile.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold truncate">
              {profile.full_name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS]}
            </p>
            {getLocationLabel(profile) && (
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center justify-center gap-0.5 min-w-0">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">
                  {getLocationLabel(profile).split(",")[0]}
                </span>
              </p>
            )}
            <div className="mt-1.5 h-5 flex items-center justify-center">
              {profile.market_status_id != null &&
                labels[profile.market_status_id] && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5"
                    style={
                      colors[profile.market_status_id]
                        ? {
                            backgroundColor: `${colors[profile.market_status_id]}20`,
                            color: colors[profile.market_status_id],
                            borderColor: `${colors[profile.market_status_id]}40`,
                          }
                        : undefined
                    }
                  >
                    {labels[profile.market_status_id]}
                  </Badge>
                )}
            </div>
          </div>
        </CardContent>
      </Link>
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <ConnectButton
          targetUserId={profile.id}
          initialStatus={connectionStatus}
          onStatusChange={onStatusChange}
          variant="outline"
          size="sm"
          className="w-full h-8 rounded-full text-xs"
        />
      </div>
    </Card>
  );
}

export default function NetworkPage() {
  return <NetworkContent />;
}
