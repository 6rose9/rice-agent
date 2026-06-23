"use client";

import { useState, useMemo, useEffect } from "react";
import { RightRail } from "@/components/layout/right-rail";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@/hooks/use-search";
import { useRegions } from "@/hooks/use-regions";
import { useRecentSearches } from "@/hooks/use-recent-searches";
import { ROLE_LABELS } from "@/lib/constants";
import type { UserRole } from "@/types";
import { Search, X, Clock, User, MessageCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const QUICK_FILTERS: { label: string; value: UserRole | "all" }[] = [
  { label: "🌾 All", value: "all" },
  { label: "🧑‍🌾 Farmers", value: "farmer" },
  { label: "🏭 Traders", value: "trader" },
  { label: "🤝 Agents", value: "agent" },
];

function getLocationLabel(regionId: number | null, regions: { id: number; name: { en: string; my: string } }[]): string {
  if (!regionId) return "";
  const region = regions.find((r) => r.id === regionId);
  return region?.name.en ?? "";
}

function SearchContent() {
  const [activeFilter, setActiveFilter] = useState<UserRole | "all">("all");
  const recentSearches = useRecentSearches();

  const { regions } = useRegions();
  const searchFilters = useMemo(
    () => ({
      role: activeFilter,
    }),
    [activeFilter]
  );

  const { query, setQuery, results, loading } = useSearch(searchFilters);

  // Save query to recent searches when results arrive
  useEffect(() => {
    if (query.trim() && results && results.count > 0) {
      recentSearches.add(query);
    }
  }, [query, results, recentSearches.add]);

  return (
    <div className="flex">
      <div className="flex-1 min-w-0">
        {/* Search bar */}
        <div className="px-4 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search traders, rice types..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-8 h-10 rounded-full bg-muted/50"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Quick filters */}
        <div className="flex gap-1.5 px-4 py-2 overflow-x-auto border-b">
          {QUICK_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={activeFilter === f.value ? "default" : "outline"}
              size="sm"
              className="rounded-full h-7 text-xs whitespace-nowrap"
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Idle state */}
        {!query.trim() && (
          <div className="px-4 py-4">
            {recentSearches.items.length > 0 && (
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Recent Searches
                    </h3>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={recentSearches.clear}
                    >
                      Clear All
                    </Button>
                  </div>
                  {recentSearches.items.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="flex items-center gap-2 text-sm w-full text-left py-1 hover:text-primary transition-colors"
                    >
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {term}
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="mt-4 lg:hidden">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Trending Topics
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="cursor-pointer">🌾 Paw San</Badge>
                <Badge variant="secondary" className="cursor-pointer">📍 Delta</Badge>
                <Badge variant="secondary" className="cursor-pointer">💰 &lt;15K</Badge>
                <Badge variant="secondary" className="cursor-pointer">🍚 Shwe Bo</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {query.trim() && loading && (
          <div className="px-4 py-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground mb-3">
              &quot;{query}&quot; — {results.count} results
            </p>

            {/* MOBILE: Stacked results */}
            <div className="lg:hidden space-y-3">
              {results.users.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <Link href={`/profile/${profile.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
                      <AvatarFallback className="bg-accent text-sm">
                        {profile.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{profile.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ROLE_LABELS[profile.role as UserRole]} · {getLocationLabel(profile.region_id, regions)}
                      </p>
                    </div>
                  </Link>
                  <Link href="/messages">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
              {results.posts.map((post) => (
                <Card key={post.id} className="hover:bg-accent/30 transition-colors cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={post.type === "selling" ? "default" : "secondary"}
                        className="text-[10px] h-5"
                      >
                        {post.type === "selling" ? "Selling" : "Buying"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {post.region}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    {post.price && (
                      <p className="text-xs font-medium mt-1">
                        {post.price.toLocaleString()} Ks/basket
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {results.count === 0 && (
                <div className="text-center py-16">
                  <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">No results for &quot;{query}&quot;</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try different keywords or filters.
                  </p>
                </div>
              )}
            </div>

            {/* DESKTOP: 2-column results */}
            <div className="hidden lg:flex gap-0 h-[calc(100vh-12rem)]">
              <div className="w-1/2 overflow-y-auto border-r pr-3 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground sticky top-0 bg-background py-1">
                  Users ({results.users.length})
                </h4>
                {results.users.length > 0 ? (
                  results.users.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Link href={`/profile/${profile.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
                          <AvatarFallback className="bg-accent text-xs">
                            {profile.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {profile.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {ROLE_LABELS[profile.role as UserRole]}
                            {getLocationLabel(profile.region_id, regions) && ` · ${getLocationLabel(profile.region_id, regions)}`}
                          </p>
                        </div>
                      </Link>
                      <Link href="/messages">
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          <MessageCircle className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No users found
                  </p>
                )}
              </div>

              <div className="w-1/2 overflow-y-auto pl-3 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground sticky top-0 bg-background py-1">
                  Posts ({results.posts.length})
                </h4>
                {results.posts.length > 0 ? (
                  results.posts.map((post) => (
                    <Card
                      key={post.id}
                      className="hover:bg-accent/30 transition-colors cursor-pointer border-0 shadow-none"
                    >
                      <CardContent className="p-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge
                            variant={post.type === "selling" ? "default" : "secondary"}
                            className="text-[10px] h-4 px-1"
                          >
                            {post.type === "selling" ? "Selling" : "Buying"}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {post.region}
                          </span>
                        </div>
                        <p className="text-xs line-clamp-2">{post.content}</p>
                        {post.price && (
                          <p className="text-[11px] font-medium mt-1">
                            {post.price.toLocaleString()} Ks/basket
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No posts found
                  </p>
                )}
              </div>
            </div>

            {results.count === 0 && (
              <div className="hidden lg:flex flex-col items-center justify-center py-16">
                <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">No results for &quot;{query}&quot;</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try different keywords or filters.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <RightRail variant="search" />
    </div>
  );
}

export default function SearchPage() {
  return <SearchContent />;
}
