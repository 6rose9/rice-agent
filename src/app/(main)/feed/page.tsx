"use client";

import { useState, useMemo } from "react";
import { RightRail } from "@/components/layout/right-rail";
import { FeedFilter } from "@/components/feed/feed-filter";
import { PostCard } from "@/components/feed/post-card";
import { SkeletonCard } from "@/components/feed/skeleton-card";
import { EmptyCard } from "@/components/feed/empty-card";
import { ErrorCard } from "@/components/feed/error-card";
import { useAuth } from "@/components/auth/auth-provider";
import { mockPosts } from "@/lib/mock-data";
import type { FeedFilter as FeedFilterType } from "@/types";

function FeedContent() {
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<FeedFilterType>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const filteredPosts = useMemo(() => {
    if (loading) return [];
    if (error) return [];

    let posts = mockPosts;

    if (filter === "buying") {
      posts = posts.filter((p) => p.type === "buying");
    } else if (filter === "selling") {
      posts = posts.filter((p) => p.type === "selling");
    } else if (filter === "following") {
      if (!isAuthenticated) return [];
      posts = posts.slice(0, 3);
    }

    return posts;
  }, [filter, loading, error, isAuthenticated]);

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
          <ErrorCard
            onRetry={() => {
              setError(false);
              setLoading(false);
            }}
          />
        ) : filteredPosts.length === 0 ? (
          <EmptyCard
            message={
              filter === "following" && !isAuthenticated
                ? "Sign in to see posts from people you follow"
                : "No posts yet"
            }
            subtext={
              filter === "following" && !isAuthenticated
                ? "Follow rice traders to see their updates in your feed."
                : "Be the first to share a post in the rice community."
            }
          />
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isAuthenticated={isAuthenticated}
            />
          ))
        )}
      </div>

      <RightRail variant="feed" />
    </div>
  );
}

export default function FeedPage() {
  return <FeedContent />;
}
