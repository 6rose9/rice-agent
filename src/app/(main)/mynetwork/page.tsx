"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RightRail } from "@/components/layout/right-rail";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABELS } from "@/lib/constants";
import { getSuggestedProfiles } from "@/lib/network/actions";
import { useMarketStatuses } from "@/hooks/use-market-statuses";
import { useRegions } from "@/hooks/use-regions";
import type { Profile } from "@/types";
import { Users, UserPlus, MapPin, RefreshCw } from "lucide-react";

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
  const { labels, colors } = useMarketStatuses();
  const { getLocationLabel } = useRegions();

  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const profiles = await getSuggestedProfiles(12);
        if (!cancelled) setSuggestions(profiles);
      } catch {
        if (!cancelled) setError("Failed to load suggestions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

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

  return (
    <div className="flex">
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <h1 className="text-xl font-bold">My Network</h1>
        </div>

        {/* PEOPLE YOU MAY KNOW SECTION */}
        <section id="people-you-may-know" className="py-4 sm:py-5">
          <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
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
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 sm:px-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SuggestionSkeleton key={i} />
                ))
              : suggestions.map((profile) => (
                  <SuggestionCard
                    key={profile.id}
                    profile={profile}
                    labels={labels}
                    colors={colors}
                    getLocationLabel={getLocationLabel}
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

      <RightRail variant="network" />
    </div>
  );
}

function SuggestionCard({
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
    <Link href={`/profile/${profile.username}`} className="block">
      <Card className="overflow-hidden border hover:shadow-sm transition-shadow h-full">
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
            <p className="text-sm font-semibold hover:text-primary hover:underline transition-colors">
              {profile.full_name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS]}
            </p>
            {getLocationLabel(profile) && (
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center justify-center gap-0.5">
                <MapPin className="h-2.5 w-2.5" />
                {getLocationLabel(profile).split(",")[0]}
              </p>
            )}
            <div className="mt-1.5 h-5 flex items-center justify-center">
              {profile.market_status_id != null && labels[profile.market_status_id] && (
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
          <Button
            variant="outline"
            className="w-full mt-3 h-8 rounded-full text-xs font-medium relative z-10"
            onClick={(e) => e.preventDefault()}
          >
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Connect
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function NetworkPage() {
  return <NetworkContent />;
}
