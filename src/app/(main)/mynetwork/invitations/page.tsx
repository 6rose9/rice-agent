"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RightRail } from "@/components/layout/right-rail";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPendingRequests,
  getConnectionCount,
  getFollowerCount,
  getFollowingCount,
  type ConnectionRequestRow,
} from "@/lib/network/actions";
import { InvitationCard } from "@/components/network/invitation-card";
import { Mail, ArrowLeft, UserPlus } from "lucide-react";

// ── Skeleton ──────────────────────────────────────────────────────

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

// ── Page Content ──────────────────────────────────────────────────

function InvitationsContent() {
  const { isAuthenticated, user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<ConnectionRequestRow[]>([]);
  const [stats, setStats] = useState({ connections: 0, followers: 0, following: 0, pending: 0 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pending, connCount, followerCount, followingCount] =
        await Promise.all([
          getPendingRequests(),
          currentUser?.profile.id ? getConnectionCount(currentUser.profile.id) : 0,
          currentUser?.profile.id ? getFollowerCount(currentUser.profile.id) : 0,
          currentUser?.profile.id ? getFollowingCount(currentUser.profile.id) : 0,
        ]);
      setInvitations(pending);
      setStats({ connections: connCount, followers: followerCount, following: followingCount, pending: pending.length });
    } catch {
      console.error("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleAccepted(requestId: string) {
    setInvitations((prev) => prev.filter((r) => r.id !== requestId));
    setStats((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1), connections: prev.connections + 1 }));
  }

  function handleDeclined(requestId: string) {
    setInvitations((prev) => prev.filter((r) => r.id !== requestId));
    setStats((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1) }));
  }

  if (!isAuthenticated) {
    return (
      <SignInGate
        icon={Mail}
        title="Sign in to see your invitations"
        description="Manage your connection requests from rice traders, farmers, millers, and agents."
        redirectTo="/mynetwork/invitations"
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
            <h1 className="text-xl font-bold">Invitations</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${invitations.length} pending`}
            </p>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <InvitationSkeleton key={i} />
            ))}
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No pending invitations</p>
            <p className="text-xs text-muted-foreground mt-1">
              All caught up! Connection requests you receive will appear here.
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
                onAccepted={() => handleAccepted(inv.id)}
                onDeclined={() => handleDeclined(inv.id)}
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

export default function InvitationsPage() {
  return <InvitationsContent />;
}
