"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RightRail } from "@/components/layout/right-rail";
import { FeedFilter } from "@/components/feed/feed-filter";
import { PostCard } from "@/components/feed/post-card";
import { SkeletonCard } from "@/components/feed/skeleton-card";
import { EmptyCard } from "@/components/feed/empty-card";
import { ErrorCard } from "@/components/feed/error-card";
import { useAuth } from "@/components/auth/auth-provider";
import { getPosts } from "@/lib/posts/actions";
import type { FeedFilter as FeedFilterType, Post } from "@/types";
import { Loader2 } from "lucide-react";

function FeedContent() {
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<FeedFilterType>("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await getPosts();
      setPosts(result.posts);
      setNextCursor(result.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts();
  }, [fetchPosts]);

  async function handleLoadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await getPosts(nextCursor);
      setPosts((prev) => [...prev, ...result.posts]);
      setNextCursor(result.nextCursor);
    } catch {
      // Silently fail — posts already loaded stay visible
    } finally {
      setLoadingMore(false);
    }
  }

  const filteredPosts = useMemo(() => {
    if (loading) return [];
    if (error) return [];

    let result = posts;

    if (filter === "buying") {
      result = result.filter((p) => p.type === "buying");
    } else if (filter === "selling") {
      result = result.filter((p) => p.type === "selling");
    } else if (filter === "following") {
      if (!isAuthenticated) return [];
      // Fix #5: following feed requires follow-join — not implemented yet
      // Return empty to trigger the "no posts" empty state below
      return [];
    }

    return result;
  }, [posts, filter, loading, error, isAuthenticated]);

  return (
    <div className="flex">
      <div className="flex-1 min-w-0">
        <FeedFilter
          value={filter}
          onChange={setFilter}
          isAuthenticated={isAuthenticated}
        />

        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <ErrorCard onRetry={fetchPosts} />
        ) : filteredPosts.length === 0 ? (
          <EmptyCard
            message={
              filter === "following" && !isAuthenticated
                ? "Sign in to see posts from people you follow"
                : filter === "following"
                  ? "Follow some users to see their posts here"
                  : "No posts yet"
            }
            subtext={
              filter === "following" && !isAuthenticated
                ? "Follow rice traders to see their updates in your feed."
                : filter === "following"
                  ? "Visit profiles of traders, farmers, and agents you're interested in."
                  : "Be the first to share a post in the rice community."
            }
          />
        ) : (
          <>
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isAuthenticated={isAuthenticated}
              />
            ))}
            {nextCursor && filter === "all" && (
              <div className="flex justify-center py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore && (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  )}
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <RightRail variant="feed" />
    </div>
  );
}

export default function FeedPage() {
  return <FeedContent />;
}
