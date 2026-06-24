"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostActions } from "@/components/feed/post-actions";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";
import { formatRelativeTime, formatPrice, formatQuantity } from "@/lib/utils/format";
import { ROLE_LABELS } from "@/lib/constants";
import { useMarketStatuses } from "@/hooks/use-market-statuses";
import { deletePost } from "@/lib/posts/actions";
import { MapPin, Wheat, Banknote, Package, MoreHorizontal, Pencil, Trash2, Navigation } from "lucide-react";

interface PostCardProps {
  post: Post;
  isAuthenticated?: boolean;
  currentUserId?: string;
  onRefresh?: () => void;
}

const TYPE_CONFIG = {
  general: { label: "📝 General", variant: "outline" as const },
  selling: { label: "🛒 Selling", variant: "default" as const },
  buying: { label: "💰 Buying", variant: "secondary" as const },
};

export function PostCard({ post, isAuthenticated = false, currentUserId, onRefresh }: PostCardProps) {
  const { author, type, content, rice_type, price, quantity, unit, address, region, township, easy_to_carry, pound_per_bag, paddy_condition, badge, images } = post;
  const router = useRouter();
  const [displayTime, setDisplayTime] = useState(post.created_at);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { labels: marketStatusLabels } = useMarketStatuses();

  const typeInfo = TYPE_CONFIG[type] || TYPE_CONFIG.general;
  const isPremium = type === "buying" || type === "selling";
  const isAuthor = isAuthenticated && currentUserId === post.author_id;

  useEffect(() => {
    setDisplayTime(formatRelativeTime(post.created_at));
  }, [post.created_at]);

  return (
    <Card className="border-b border-border/50 rounded-none shadow-none last:border-b-0">
      <CardContent className="p-4">
        {/* Header — author info */}
        <div className="flex items-start gap-3 mb-3">
          <Link href={`/profile/${author.username}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={author.avatar_url ?? undefined} />
              <AvatarFallback className="bg-accent text-sm">
                {author.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profile/${author.username}`}
                className="font-medium text-sm hover:text-primary transition-colors"
              >
                {author.full_name}
              </Link>
              {isPremium && (
                <Badge
                  variant={typeInfo.variant}
                  className="text-[10px] h-5 px-1.5 font-medium uppercase tracking-wide gap-0.5"
                >
                  {typeInfo.label}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {ROLE_LABELS[author.role as keyof typeof ROLE_LABELS] || author.role}
              {author.market_status_id && marketStatusLabels[author.market_status_id] && (
                <> · {marketStatusLabels[author.market_status_id]}</>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5" suppressHydrationWarning>
              {displayTime}
            </p>
          </div>

          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-8 w-8",
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/posts/${post.id}/edit`)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="post-content text-sm whitespace-pre-line mb-3">
          {content}
        </div>

        {/* Images grid */}
        {images.length > 0 && (
          <div
            className={`grid gap-1 mb-3 ${
              images.length === 1
                ? "grid-cols-1"
                : images.length === 2
                ? "grid-cols-2"
                : images.length === 3
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3"
            }`}
          >
            {images.map((img, idx) => (
              <div
                key={img.id}
                className={`relative overflow-hidden rounded-md bg-muted ${
                  images.length === 3 && idx === 0 ? "row-span-2" : ""
                }`}
              >
                <img
                  src={img.url}
                  alt={`Post image ${idx + 1}`}
                  className="w-full h-full object-cover aspect-[4/3]"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* Meta tags — only for buying/selling */}
        {isPremium && (
          <div className="rounded-lg bg-muted/50 p-3 mb-3 space-y-2.5">
            {/* Primary info: rice type + price */}
            <div className="flex flex-wrap items-center gap-2">
              {rice_type && (
                <Badge variant="secondary" className="gap-1 font-normal">
                  <Wheat className="h-3 w-3" />
                  {rice_type}
                </Badge>
              )}
              {price != null && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <Banknote className="h-4 w-4" />
                  {formatPrice(price)}
                  <span className="text-xs font-normal text-muted-foreground">/ 100 baskets</span>
                </span>
              )}
            </div>

            {/* Secondary info: quantity, location, specs */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {quantity != null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border text-muted-foreground">
                  <Package className="h-3 w-3" />
                  {formatQuantity(quantity, "baskets")}
                </span>
              )}
              {region && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {township ? `${township}, ` : ""}
                  {region}
                </span>
              )}
              {address && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border text-muted-foreground">
                  🏠 {address}
                </span>
              )}
              {pound_per_bag != null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border text-muted-foreground">
                  <Image src="/assets/bag.jpeg" alt="" width={14} height={14} className="rounded-sm" />
                  {pound_per_bag} lb/bag
                </span>
              )}
              {paddy_condition != null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border text-muted-foreground">
                  ☀️ Moisture: {paddy_condition}%
                </span>
              )}
              {easy_to_carry && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 border border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-400">
                  🚚 Easy to carry
                </span>
              )}
              {post.latitude != null && post.longitude != null && (
                <button
                  type="button"
                  onClick={() => setShowMapDialog(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Navigation className="h-3 w-3" />
                  Get Directions
                </button>
              )}
            </div>
          </div>
        )}

        {/* Divider + Actions */}
        <div className="border-t pt-1">
          <PostActions
            postId={post.id}
            reactionCount={post.reaction_count}
            commentCount={post.comment_count}
            isLiked={post.is_liked}
            isSaved={post.is_saved}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </CardContent>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                setDeleting(true);
                const result = await deletePost(post.id);
                if (result.success) {
                  setShowDeleteDialog(false);
                  onRefresh?.();
                }
                setDeleting(false);
              }}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Map dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>📍 Post Location</DialogTitle>
          </DialogHeader>
          <div className="w-full h-64 rounded-md overflow-hidden border bg-muted">
            {showMapDialog && post.latitude != null && post.longitude != null && (
              <iframe
                src={`https://maps.google.com/maps?q=${post.latitude},${post.longitude}&z=15&output=embed`}
                width="100%"
                height="100%"
                className="w-full h-full"
                loading="lazy"
                title="Post location"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowMapDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
