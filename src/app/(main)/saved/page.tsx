"use client";

import { useState, useEffect, useCallback } from "react";
import { PostCard } from "@/components/feed/post-card";
import { SkeletonCard } from "@/components/feed/skeleton-card";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { getSavedPosts } from "@/lib/posts/actions";
import type { Post } from "@/types";
import { Bookmark } from "lucide-react";
import { RiceSeedIcon } from "@/components/icons/rice-seed";

export default function SavedPage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSavedPosts();
      setPosts(result);
    } catch (err) {
      console.error("Failed to fetch saved posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSaved();
    }
  }, [isAuthenticated, fetchSaved]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-[780px]">
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <Bookmark className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Saved Posts</h1>
        </div>
        <SignInGate
          icon={Bookmark}
          title="Sign in to see saved posts"
          description="Sign in to save posts and access them anytime."
          redirectTo="/saved"
        />
      </div>
    );
  }

  return (
    <div className="max-w-[780px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Bookmark className="h-5 w-5" />
        <h1 className="text-lg font-semibold">Saved Posts</h1>
      </div>

      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="h-20 w-20 rounded-full bg-muted/80 ring-1 ring-border/50 flex items-center justify-center mb-4 relative">
            <Bookmark className="h-8 w-8 text-muted-foreground" />
            <RiceSeedIcon size={24} className="text-muted-foreground/20 absolute bottom-2 -right-1" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight mb-2">No saved posts yet</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bookmark posts to save them here for later.
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isAuthenticated={isAuthenticated}
            onRefresh={fetchSaved}
          />
        ))
      )}
    </div>
  );
}
