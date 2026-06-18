"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RightRail } from "@/components/layout/right-rail";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  mockInvitations,
  mockSuggestions,
  roleLabels,
  networkStats,
  getLocationLabel,
  marketStatusShort,
} from "@/lib/mock-data";
import {
  Users,
  UserPlus,
  UserCheck,
  Clock,
  X,
  Check,
  MapPin,
  ChevronRight,
} from "lucide-react";

function InvitationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-4 sm:px-6">
      <Skeleton className="h-12 w-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-20" />
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
      <div className="h-14 bg-muted" />
      <CardContent className="p-4 pt-0">
        <div className="flex justify-center -mt-7 mb-2">
          <Skeleton className="h-14 w-14 rounded-full ring-2 ring-card" />
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

function NetworkContent() {
  const { isAuthenticated } = useAuth();

  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const [invitations, setInvitations] = useState(mockInvitations);

  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 900);
    return () => clearTimeout(t);
  }, []);

  const loading = phase === "loading";

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">
          Sign in to manage your network
        </h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          Connect with rice traders, farmers, millers, and agents across Myanmar.
        </p>
        <Link href="/login?redirect=%2Fmynetwork">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  function handleAccept(id: string) {
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
  }

  function handleIgnore(id: string) {
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
  }

  function handleIgnoreAll() {
    setInvitations([]);
  }

  const pending = loading ? 3 : invitations.length;

  return (
    <div className="flex">
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <h1 className="text-xl font-bold">My Network</h1>
        </div>

        {/* Stats sub-bar */}
        <div className="px-4 pb-3 sm:px-6 flex items-center gap-1 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {networkStats.connections}
          </span>{" "}
          connections
          <span className="mx-1.5 text-border">·</span>
          {loading ? (
            <Skeleton className="h-4 w-24 inline-block" />
          ) : (
            <>
              <span className="font-semibold text-foreground">{pending}</span>{" "}
              pending invitations
            </>
          )}
        </div>

        {/* MOBILE: quick-jump tabs */}
        <div className="md:hidden flex border-b overflow-x-auto no-scrollbar">
          <a
            href="#invitations"
            className="px-4 py-2.5 text-sm font-medium whitespace-nowrap hover:text-primary transition-colors"
          >
            Invitations
            {pending > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({pending} new)
              </span>
            )}
          </a>
          <a
            href="#people-you-may-know"
            className="px-4 py-2.5 text-sm font-medium whitespace-nowrap hover:text-primary transition-colors"
          >
            People You May Know
          </a>
        </div>

        {/* INVITATIONS SECTION */}
        <section id="invitations">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invitations
              {!loading && pending > 0 && (
                <Badge variant="secondary" className="text-xs h-5">
                  {pending} new
                </Badge>
              )}
            </h2>
            {!loading && pending > 0 && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={handleIgnoreAll}
              >
                Ignore All
              </Button>
            )}
          </div>

          {loading ? (
            <div className="divide-y">
              <InvitationSkeleton />
              <InvitationSkeleton />
              <InvitationSkeleton />
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <UserCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">No pending invitations</p>
              <p className="text-xs text-muted-foreground mt-1">
                All caught up! Invitations you receive will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {invitations.map((inv) => (
                <Card
                  key={inv.id}
                  className="border-0 border-b rounded-none shadow-none last:border-b-0"
                >
                  <CardContent className="p-4 sm:px-6">
                    <div className="flex items-start gap-3">
                      <Link
                        href={`/profile/${inv.from.username}`}
                        className="shrink-0"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-lg bg-accent">
                            {inv.from.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              href={`/profile/${inv.from.username}`}
                              className="text-sm font-semibold hover:text-primary hover:underline transition-colors"
                            >
                              {inv.from.full_name}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
                              <span>{roleLabels[inv.from.role]}</span>
                              {getLocationLabel(inv.from) && (
                                <>
                                  <span>·</span>
                                  <MapPin className="h-2.5 w-2.5" />
                                  <span>{getLocationLabel(inv.from).split(",")[0]}</span>
                                </>
                              )}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                            {inv.mutual_connections} mutual
                          </span>
                        </div>
                        {inv.message && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                            &quot;{inv.message}&quot;
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(inv.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <div className="flex gap-2 mt-2.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-full text-xs"
                            onClick={() => handleIgnore(inv.id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Ignore
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 rounded-full text-xs"
                            onClick={() => handleAccept(inv.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && (
            <div className="px-4 py-2.5 sm:px-6 border-t">
              <Link
                href="/mynetwork/invitations"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                See all invitation history
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </section>

        {/* PEOPLE YOU MAY KNOW SECTION */}
        <section id="people-you-may-know" className="py-4 sm:py-5">
          <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              People You May Know
            </h2>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              See All →
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 sm:px-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SuggestionSkeleton key={i} />
                ))
              : mockSuggestions.map((profile) => (
                  <SuggestionCard key={profile.id} profile={profile} />
                ))}
          </div>
        </section>

        {/* Mobile-only stats */}
        <section className="lg:hidden px-4 pb-8 sm:px-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Your Network Stats
          </h3>
          <Card>
            <CardContent className="p-4 space-y-2.5 text-sm">
              <StatRow label="Connections" value={networkStats.connections} />
              <StatRow label="Following" value={networkStats.following} />
              <StatRow label="Followers" value={networkStats.followers} />
              <StatRow label="Pending" value={pending} />
            </CardContent>
          </Card>
        </section>
      </div>

      <RightRail variant="network" />
    </div>
  );
}

function SuggestionCard({ profile }: { profile: (typeof mockSuggestions)[number] }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  function handleConnect() {
    if (!isAuthenticated) {
      router.push("/login?redirect=%2Fmynetwork");
      return;
    }
    // TODO: send connection request
  }

  return (
    <Card className="overflow-hidden border hover:shadow-sm transition-shadow">
      <div className="h-14 bg-gradient-to-r from-emerald-100 to-green-50 dark:from-emerald-900 dark:to-green-950" />
      <CardContent className="p-4 pt-0">
        <div className="flex justify-center -mt-7 mb-2">
          <Avatar className="h-14 w-14 ring-2 ring-card">
            <AvatarFallback className="text-lg bg-accent">
              {profile.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center">
          <Link
            href={`/profile/${profile.username}`}
            className="text-sm font-semibold hover:text-primary hover:underline transition-colors"
          >
            {profile.full_name}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            {roleLabels[profile.role]}
          </p>
          {getLocationLabel(profile) && (
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center justify-center gap-0.5">
              <MapPin className="h-2.5 w-2.5" />
              {getLocationLabel(profile).split(",")[0]}
            </p>
          )}
          {profile.market_status_id != null && (
            <Badge variant="outline" className="mt-1.5 text-[10px] h-5">
              {marketStatusShort[profile.market_status_id] ?? ""}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          className="w-full mt-3 h-8 rounded-full text-xs font-medium"
          onClick={handleConnect}
        >
          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
          Connect
        </Button>
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export default function NetworkPage() {
  return <NetworkContent />;
}
