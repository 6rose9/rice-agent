"use client";

import { useState, useMemo } from "react";
import { RightRail } from "@/components/layout/right-rail";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { mockProfiles, mockPosts, roleLabels, getLocationLabel, mockRegions, mockTownships } from "@/lib/mock-data";
import { Search, X, Clock, User, MessageCircle } from "lucide-react";
import Link from "next/link";

const QUICK_FILTERS = [
  { label: "🌾 All", value: "all" },
  { label: "🧑‍🌾 Farmers", value: "farmer" },
  { label: "🏭 Traders", value: "trader" },
  { label: "🤝 Agents", value: "agent" },
];

function SearchContent() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [recentSearches] = useState([
    "Paw San rice",
    "U Kyaw Min",
    "Shwe Bo",
  ]);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    const users = mockProfiles.filter(
      (p) =>
        (activeFilter === "all" || p.role === activeFilter) &&
        (p.full_name.toLowerCase().includes(q) ||
          p.username.toLowerCase().includes(q) ||
          getLocationLabel(p).toLowerCase().includes(q))
    );

    const posts = mockPosts.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.rice_type?.toLowerCase().includes(q) ||
        p.region?.toLowerCase().includes(q)
    );

    return { users, posts, count: users.length + posts.length };
  }, [query, activeFilter]);

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
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Recent Searches
                  </h3>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                    Clear All
                  </Button>
                </div>
                {recentSearches.map((term) => (
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

        {/* Results */}
        {results && (
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground mb-3">
              &quot;{query}&quot; — {results.count} results
            </p>

            {/* MOBILE: Stacked results */}
            <div className="lg:hidden space-y-3">
              {results.users.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/profile/${profile.username}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-accent text-sm">
                      {profile.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{profile.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {roleLabels[profile.role]} · {getLocationLabel(profile)}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </Link>
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
                        by {post.author.full_name}
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
                  Users
                </h4>
                {results.users.length > 0 ? (
                  results.users.map((profile) => (
                    <Link
                      key={profile.id}
                      href={`/profile/${profile.username}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-accent text-xs">
                          {profile.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {profile.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {roleLabels[profile.role]}
                          {getLocationLabel(profile) && ` · ${getLocationLabel(profile).split(",")[0]}`}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No users found
                  </p>
                )}
              </div>

              <div className="w-1/2 overflow-y-auto pl-3 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground sticky top-0 bg-background py-1">
                  Posts
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
                            by {post.author.full_name}
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
