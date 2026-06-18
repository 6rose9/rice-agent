"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { SignInGate } from "@/components/auth/sign-in-gate";
import { CreatePostForm } from "@/components/post/create-post-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusSquare } from "lucide-react";

function CreatePostContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <SignInGate
        icon={PlusSquare}
        title="Sign in to create posts"
        description="Share your rice listings, connect with buyers and sellers across Myanmar."
        redirectTo="/posts/create"
      />
    );
  }

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
        <h1 className="text-base font-semibold">Create Post</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <CreatePostForm
          onSuccess={() => router.push("/feed")}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}

export default function CreatePostPage() {
  return <CreatePostContent />;
}
