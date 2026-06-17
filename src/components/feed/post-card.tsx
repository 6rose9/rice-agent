"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostActions } from "@/components/feed/post-actions";
import type { Post } from "@/types";
import { timeAgo, formatPrice, formatQuantity } from "@/lib/mock-data";
import { MapPin, Wheat, Banknote, Package } from "lucide-react";

interface PostCardProps {
  post: Post;
  isAuthenticated?: boolean;
}

export function PostCard({ post, isAuthenticated = false }: PostCardProps) {
  const { author, type, content, rice_type, price, quantity, location, images } = post;
  const [displayTime, setDisplayTime] = useState(post.created_at);

  useEffect(() => {
    setDisplayTime(timeAgo(post.created_at));
  }, [post.created_at]);

  return (
    <Card className="border-b border-border/50 rounded-none shadow-none last:border-b-0">
      <CardContent className="p-4">
        {/* Header — author info */}
        <div className="flex items-start gap-3 mb-3">
          <Link href={`/profile/${author.username}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={author.avatar_url} />
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
              <Badge
                variant={type === "selling" ? "default" : "secondary"}
                className="text-[10px] h-5 px-1.5 font-medium uppercase tracking-wide"
              >
                {type === "selling" ? "🛒 Selling" : "💰 Buying"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5" suppressHydrationWarning>
              {displayTime}
            </p>
          </div>
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

        {/* Meta tags */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-xs text-muted-foreground">
          {rice_type && (
            <span className="inline-flex items-center gap-1">
              <Wheat className="h-3 w-3" />
              {rice_type}
            </span>
          )}
          {price != null && (
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Banknote className="h-3 w-3" />
              {formatPrice(price)}/basket
            </span>
          )}
          {quantity != null && (
            <span className="inline-flex items-center gap-1">
              <Package className="h-3 w-3" />
              {formatQuantity(quantity)}
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
          )}
        </div>

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
    </Card>
  );
}
