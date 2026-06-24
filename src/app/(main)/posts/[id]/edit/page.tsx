"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { getPost } from "@/lib/posts/actions";
import { EditPostForm } from "@/components/post/edit-post-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion, Loader2, ShieldAlert } from "lucide-react";
import type { Post } from "@/types";

function EditPostContent() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    async function fetchPost() {
      const data = await getPost(postId);
      if (!data) {
        setError("Post not found.");
        setLoading(false);
        return;
      }
      if (data.author_id !== user!.user.id) {
        setError("You can only edit your own posts.");
        setLoading(false);
        return;
      }
      setPost(data);
      setLoading(false);
    }

    fetchPost();
  }, [postId, isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <SignInGate
        icon={ArrowLeft}
        title="Sign in to edit posts"
        description="You need to be signed in to edit your posts."
        redirectTo={`/posts/${postId}/edit`}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full max-w-[780px]">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-base font-semibold">Edit Post</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col h-full max-w-[780px]">
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-base font-semibold">Edit Post</h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            {error === "Post not found." ? (
              <FileQuestion className="h-8 w-8 text-destructive" />
            ) : (
              <ShieldAlert className="h-8 w-8 text-destructive" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {error || "Something went wrong."}
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-[780px]">
      <EditPostForm post={post} />
    </div>
  );
}

export default function EditPostPage() {
  return <EditPostContent />;
}
