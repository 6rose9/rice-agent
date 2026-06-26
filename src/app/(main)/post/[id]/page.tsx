"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PostCard } from "@/components/feed/post-card";
import { RightRail } from "@/components/layout/right-rail";
import { useAuth } from "@/components/auth/auth-provider";
import { getPost } from "@/lib/posts/actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Post } from "@/types";

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const p = await getPost(params.id as string);
      if (!cancelled) {
        if (p) {
          setPost(p);
        } else {
          setError(true);
        }
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [params.id]);

  return (
    <div className="flex">
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-3 px-4 h-12">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.push("/feed")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-sm font-semibold">Post</h1>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error || !post ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Post not found.</p>
          </div>
        ) : (
          <PostCard
            post={post}
            isAuthenticated={isAuthenticated}
            onRefresh={() => window.location.reload()}
          />
        )}
      </div>

      <RightRail variant="feed" />
    </div>
  );
}
