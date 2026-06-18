"use client";

import { PostCard } from "@/components/feed/post-card";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { mockPosts } from "@/lib/mock-data";
import { Bookmark } from "lucide-react";

export default function SavedPage() {
  const { isAuthenticated } = useAuth();

  const savedPosts = mockPosts.filter((p) => p.is_saved);

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

      {savedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bookmark className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No saved posts yet</h2>
          <p className="text-sm text-muted-foreground">
            Bookmark posts to save them here for later.
          </p>
        </div>
      ) : (
        savedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isAuthenticated={isAuthenticated}
          />
        ))
      )}
    </div>
  );
}
