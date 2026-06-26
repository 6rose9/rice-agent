"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants";
import { getSuggestedProfiles } from "@/lib/network/actions";
import { getTrendingTopics, type TrendingTopic } from "@/lib/posts/actions";
import { useRegions } from "@/hooks/use-regions";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { Clock, TrendingUp, Bookmark, Sprout, Users, UserPlus, UserCheck, Mail } from "lucide-react";
import type { Profile } from "@/types";

type RightRailVariant = "feed" | "profile" | "search" | "network";

interface RightRailProps {
  variant?: RightRailVariant;
  /** Profile-specific: pass the viewed user's data for Quick Stats */
  profileStats?: { posts: number; followers: number; topCategory?: string };
  /** Network-specific: pass real counts */
  networkStats?: { connections: number; followers: number; following: number; pending: number };
  /** Search-specific: callback when a recent search term is clicked */
  onSearchSelect?: (term: string) => void;
}

function SuggestionItem({ profile }: { profile: Profile }) {
  const { getLocationLabel } = useRegions();

  return (
    <Link href={`/profile/${profile.username}`} className="flex items-center gap-3 group">
      <Avatar className="h-9 w-9 shrink-0">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover rounded-full" />
        ) : (
          <AvatarFallback className="text-sm bg-accent">
            {profile.full_name.charAt(0)}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium group-hover:text-primary truncate transition-colors">
          {profile.full_name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS] || profile.role}
          {getLocationLabel(profile) && ` · ${getLocationLabel(profile).split(",")[0]}`}
        </p>
      </div>
    </Link>
  );
}

export function RightRail({ variant = "feed", profileStats, networkStats, onSearchSelect }: RightRailProps) {
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const recentSearches = useRecentSearches();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getSuggestedProfiles(3);
        if (!cancelled) setSuggestions(data);
      } catch (err) {
        console.error("Failed to load suggestions:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadTrending() {
      try {
        const data = await getTrendingTopics(6);
        if (!cancelled) setTrendingTopics(data);
      } catch (err) {
        console.error("Failed to load trending topics:", err);
      } finally {
        if (!cancelled) setTrendingLoading(false);
      }
    }
    loadTrending();
    return () => { cancelled = true; };
  }, []);

  const baseClasses =
    "hidden lg:flex flex-col w-[260px] xl:w-[300px] gap-4 sticky top-0 h-screen pt-4 pl-4 pr-2 border-l";

  const cardClasses = "border-0 shadow-none bg-transparent px-2";

  const footerLinks = (
    <Card className="border-0 shadow-none bg-transparent px-2 mt-auto">
      <CardContent className="p-3 rounded-lg bg-muted/40 space-y-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs">
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">Help</Link>
        </div>
        <p className="text-[10px] text-muted-foreground/70">© 2026 စပါးအောင်သွယ်</p>
      </CardContent>
    </Card>
  );

  // --- Feed variant (default) ---
  if (variant === "feed") {
    return (
      <aside className={baseClasses}>
        {/* Suggestions */}
        <Card className={cardClasses}>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-2.5 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions.length > 0 ? (
              <>
                {suggestions.map((profile) => (
                  <SuggestionItem key={profile.id} profile={profile} />
                ))}
                <Link href="/search">
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                    See All →
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-1">
                No suggestions available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Trending */}
        <Card className={cardClasses}>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Trending
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-1.5">
            {trendingLoading ? (
              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                ))}
              </div>
            ) : trendingTopics.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {trendingTopics.map((topic) => (
                  <Link key={topic.value} href={`/search?q=${encodeURIComponent(topic.value)}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      {topic.emoji} {topic.label}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-1">
                No trending topics yet
              </p>
            )}
          </CardContent>
        </Card>

        {footerLinks}
      </aside>
    );
  }

  // --- Profile variant ---
  if (variant === "profile") {
    return (
      <aside className={baseClasses}>
        {/* Similar Traders */}
        <Card className={cardClasses}>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Similar Traders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-2.5 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions.length > 0 ? (
              <>
                {suggestions.map((profile) => (
                  <SuggestionItem key={profile.id} profile={profile} />
                ))}
                <Link href="/search">
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                    See All →
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-1">
                No suggestions available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {profileStats && (
          <Card className={cardClasses}>
            <CardHeader className="pb-2 pt-0">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Sprout className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{profileStats.posts}</span>
                <span className="text-muted-foreground">Posts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{profileStats.followers}</span>
                <span className="text-muted-foreground">Followers</span>
              </div>
              {profileStats.topCategory && (
                <div className="flex items-center gap-2">
                  <span>🏷️</span>
                  <span className="text-muted-foreground">Top: </span>
                  <span>{profileStats.topCategory}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {footerLinks}
      </aside>
    );
  }

  // --- Network variant ---
  if (variant === "network") {
    return (
      <aside className={baseClasses}>
        {/* Manage Network */}
        <Card className={cardClasses}>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Manage Network
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            <Link
              href="/mynetwork/connections"
              className="flex items-center justify-between text-sm py-1.5 hover:text-primary transition-colors"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Connections
              </span>
              <span className="font-semibold">{networkStats?.connections ?? 0}</span>
            </Link>
            <Link
              href="/mynetwork/following"
              className="flex items-center justify-between text-sm py-1.5 hover:text-primary transition-colors"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                Following
              </span>
              <span className="font-semibold">{networkStats?.following ?? 0}</span>
            </Link>
            <div className="flex items-center justify-between text-sm py-1.5 text-muted-foreground">
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Followers
              </span>
              <span className="font-semibold">{networkStats?.followers ?? 0}</span>
            </div>
            <Link
              href="/mynetwork/invitations"
              className="flex items-center justify-between text-sm py-1.5 hover:text-primary transition-colors"
            >
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Invitations
              </span>
              <span className="font-semibold">{networkStats?.pending ?? 0}</span>
            </Link>
          </CardContent>
        </Card>

        {footerLinks}
      </aside>
    );
  }

  // --- Search variant ---
  if (variant === "search") {
    return (
      <aside className={baseClasses}>
        {/* Recent Searches */}
        <Card className={cardClasses}>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Recent Searches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            {recentSearches.items.length > 0 ? (
              <>
                {recentSearches.items.map((term) => (
                  <button
                    key={term}
                    onClick={() => onSearchSelect?.(term)}
                    className="flex items-center gap-2 text-sm w-full text-left py-1 hover:text-primary transition-colors"
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {term}
                  </button>
                ))}
                <button
                  onClick={recentSearches.clear}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear All
                </button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-1">
                No recent searches
              </p>
            )}
          </CardContent>
        </Card>

        {/* Trending Keywords */}
        <Card className={cardClasses}>
          <CardHeader className="pb-2 pt-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Trending Keywords
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-1.5">
            {trendingLoading ? (
              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                ))}
              </div>
            ) : trendingTopics.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {trendingTopics.map((topic) => (
                  <button
                    key={topic.value}
                    onClick={() => onSearchSelect?.(topic.value)}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                  >
                    {topic.emoji} {topic.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-1">
                No trending keywords yet
              </p>
            )}
          </CardContent>
        </Card>

        {footerLinks}
      </aside>
    );
  }

  return null;
}
