"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostActions } from "@/components/feed/post-actions";
import { CommentSection } from "@/components/post/comment-section";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";
import { formatRelativeTime, formatPrice, formatQuantity } from "@/lib/utils/format";
import { ROLE_LABELS } from "@/lib/constants";
import { useMarketStatuses } from "@/hooks/use-market-statuses";
import { deletePost, reportPost } from "@/lib/posts/actions";
import { MapPin, Wheat, Banknote, Package, MoreHorizontal, Pencil, Trash2, Navigation, Flag, Home, Truck, Droplets } from "lucide-react";

interface PostCardProps {
  post: Post;
  isAuthenticated?: boolean;
  currentUserId?: string;
  onRefresh?: () => void;
}

const TYPE_CONFIG: Record<string, { label: string; variant: "outline" | "default" | "secondary"; gold?: boolean }> = {
  general: { label: "📝 General", variant: "outline" },
  selling: { label: "🛒 Selling", variant: "default", gold: true },
  buying: { label: "💰 Buying", variant: "secondary" },
};

export function PostCard({ post, isAuthenticated = false, currentUserId, onRefresh }: PostCardProps) {
  const { author, type, content, rice_type, price, quantity, unit, address, region, township, easy_to_carry, pound_per_bag, paddy_condition, badge, images } = post;
  const router = useRouter();
  const [displayTime, setDisplayTime] = useState(post.created_at);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const checkClamped = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    setIsClamped(!expanded && el.scrollHeight > el.clientHeight + 2);
  }, [expanded]);

  useEffect(() => {
    checkClamped();
  }, [content, checkClamped]);
  const { labels: marketStatusLabels } = useMarketStatuses();

  const typeInfo = TYPE_CONFIG[type] || TYPE_CONFIG.general;
  const isPremium = type === "buying" || type === "selling";
  const isAuthor = isAuthenticated && currentUserId === post.author_id;

  useEffect(() => {
    setDisplayTime(formatRelativeTime(post.created_at));
  }, [post.created_at]);

  return (
    <Card className="border-b border-border/50 rounded-none shadow-none last:border-b-0 transition-colors duration-200 hover:bg-muted/20">
      <CardContent className="px-3 py-3 sm:p-4">
        {/* Header — author info */}
        <div className="flex items-start gap-3 mb-3">
          <Link href={`/profile/${author.username}`}>
            <Avatar className={`h-10 w-10 ${isPremium ? "ring-2 ring-gold/40 ring-offset-2 ring-offset-card" : ""}`}>
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
                  className={`text-[10px] h-5 px-1.5 font-medium uppercase tracking-wide gap-0.5 ${typeInfo.gold ? "badge-gold" : ""}`}
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

          {isAuthenticated && (
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
                {isAuthor && (
                  <>
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
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="relative mb-3">
          <div
            ref={contentRef}
            className={`text-sm whitespace-pre-line leading-relaxed ${!expanded ? "line-clamp-5" : ""}`}
          >
            {content}
          </div>
          {isClamped && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              See more...
            </button>
          )}
          {expanded && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="mt-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              See less
            </button>
          )}
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
                className={`relative overflow-hidden rounded-lg bg-muted group ${
                  images.length === 3 && idx === 0 ? "row-span-2" : ""
                }`}
              >
                <img
                  src={img.url}
                  alt={`Post image ${idx + 1}`}
                  className="w-full h-full object-cover aspect-[4/3] transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* Meta tags — only for buying/selling */}
        {isPremium && (
          <div className="rounded-lg border-l-4 border-l-gold bg-muted/30 p-3 mb-3 space-y-3 transition-colors">
            {/* Primary info: rice type + price */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {rice_type && (
                  <Badge variant="secondary" className="gap-1.5 font-normal px-2.5 py-0.5">
                    <Wheat className="h-3.5 w-3.5" />
                    {rice_type}
                  </Badge>
                )}
              </div>
              {price != null && (
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gold tabular-nums">
                  <Banknote className="h-4 w-4" />
                  {formatPrice(price)}
                  <span className="text-xs font-normal text-muted-foreground">/ 100 baskets</span>
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border/50" />

            {/* Secondary info: quantity, location, specs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {quantity != null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/80 border text-muted-foreground">
                  <Package className="h-3 w-3" />
                  {formatQuantity(quantity, "baskets")}
                </span>
              )}
              {region && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/80 border text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {township ? `${township}, ` : ""}
                  {region}
                </span>
              )}
              {address && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/80 border text-muted-foreground">
                  <Home className="h-3 w-3" />
                  {address}
                </span>
              )}
              {pound_per_bag != null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/80 border text-muted-foreground">
                  <Image src="/assets/bag.jpeg" alt="" width={14} height={14} className="rounded-sm" />
                  {pound_per_bag} lb/bag
                </span>
              )}
              {paddy_condition != null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/80 border text-muted-foreground">
                  <Droplets className="h-3 w-3" />
                  Moisture: {paddy_condition}%
                </span>
              )}
              {easy_to_carry && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary cursor-default">
                  <Truck className="h-3 w-3" />
                  Easy to carry
                </span>
              )}
              {post.latitude != null && post.longitude != null && (
                <button
                  type="button"
                  onClick={() => setShowMapDialog(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gold/10 text-gold hover:bg-gold/20 transition-colors cursor-pointer"
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
            onComment={() => setShowComments((prev) => !prev)}
          />
        </div>

        {/* Comments section */}
        {showComments && <CommentSection postId={post.id} />}
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
            <DialogClose render={<Button variant="outline" />}>
              Cancel
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
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold" />
              Post Location
            </DialogTitle>
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

      {/* Report dialog */}
      <Dialog
        open={showReportDialog}
        onOpenChange={(open) => {
          setShowReportDialog(open);
          if (!open) {
            setReportReason("");
            setReportSuccess(false);
            setReportError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
            <DialogDescription>
              Why are you reporting this post? Reports help keep the community focused on the rice industry.
            </DialogDescription>
          </DialogHeader>
          {reportSuccess ? (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground">Thank you. Your report has been submitted.</p>
            </div>
          ) : (
            <>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Optional: tell us why (e.g. not rice-related, spam, inappropriate)"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                maxLength={500}
              />
              {reportError && (
                <p className="text-sm text-destructive">{reportError}</p>
              )}
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    setReporting(true);
                    setReportError("");
                    const result = await reportPost(post.id, reportReason || undefined);
                    if (result.success) {
                      setReportSuccess(true);
                    } else {
                      setReportError(result.error);
                    }
                    setReporting(false);
                  }}
                  disabled={reporting}
                >
                  {reporting ? "Reporting..." : "Report"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
