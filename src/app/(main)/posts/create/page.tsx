"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { CreatePostForm } from "@/components/post/create-post-form";
import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";

function CreatePostContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <PlusSquare className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">
          Sign in to create posts
        </h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          Share your rice listings, connect with buyers and sellers across Myanmar.
        </p>
        <Link href="/login?redirect=%2Fposts%2Fcreate">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Dialog
        open={true}
        onOpenChange={(open) => {
          if (!open) router.back();
        }}
      >
        <DialogContent className="hidden md:block sm:max-w-[560px] max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="text-base">Create Post</DialogTitle>
          </DialogHeader>
          <CreatePostForm
            onSuccess={() => router.push("/feed")}
            onCancel={() => router.back()}
          />
        </DialogContent>
      </Dialog>

      <div className="md:hidden">
        <CreatePostForm
          onSuccess={() => router.push("/feed")}
          onCancel={() => router.back()}
        />
      </div>
    </>
  );
}

export default function CreatePostPage() {
  return <CreatePostContent />;
}
