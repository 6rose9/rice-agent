"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/auth/auth-provider";
import { ImagePlus, X, Loader2 } from "lucide-react";
import type { PostType } from "@/types";

interface CreatePostFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RICE_TYPES = [
  "Paw San",
  "Shwe Bo",
  "Emata",
  "Any",
  "Other",
];

const LOCATIONS = [
  "Yangon",
  "Mandalay",
  "Ayeyarwady",
  "Sagaing",
  "Bago",
  "Shan",
  "Mon",
];

export function CreatePostForm({ onSuccess, onCancel }: CreatePostFormProps) {
  const { user } = useAuth();
  const [postType, setPostType] = useState<PostType>("selling");
  const [content, setContent] = useState("");
  const [riceType, setRiceType] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Mock image upload — simulate adding placeholder images
  function handleAddImage() {
    if (images.length >= 4) return;
    setImages([
      ...images,
      `/api/placeholder/400/300?text=Image+${images.length + 1}`,
    ]);
  }

  function handleRemoveImage(idx: number) {
    setImages(images.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please add a description.");
      return;
    }
    setError("");
    setSubmitting(true);
    // Mock submit
    setTimeout(() => {
      setSubmitting(false);
      setContent("");
      setRiceType("");
      setPrice("");
      setQuantity("");
      setLocation("");
      setImages([]);
      onSuccess?.();
    }, 800);
  }

  const isValid = content.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-accent">
            {user?.full_name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium">{user?.full_name || "You"}</p>
          <p className="text-[10px] text-muted-foreground">
            Posting as {user?.role || "General User"}
          </p>
        </div>
        <Badge
          variant={postType === "selling" ? "default" : "secondary"}
          className="text-xs"
        >
          {postType === "selling" ? "🛒 Selling" : "💰 Buying"}
        </Badge>
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Post type toggle */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={postType === "selling" ? "default" : "outline"}
            className="flex-1"
            size="sm"
            onClick={() => setPostType("selling")}
          >
            🛒 Selling
          </Button>
          <Button
            type="button"
            variant={postType === "buying" ? "default" : "outline"}
            className="flex-1"
            size="sm"
            onClick={() => setPostType("buying")}
          >
            💰 Buying
          </Button>
        </div>

        {/* Content textarea */}
        <div>
          <Textarea
            placeholder="What do you want to share?"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError("");
            }}
            className="min-h-[120px] resize-none text-sm"
            autoFocus
          />
          {error && (
            <p className="text-xs text-destructive mt-1">{error}</p>
          )}
        </div>

        {/* Images */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            📷 Add Photos (max 4)
          </Label>
          <div className="flex gap-2 flex-wrap">
            {images.map((url, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-md overflow-hidden bg-muted">
                <img
                  src={url}
                  alt={`Upload ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <button
                type="button"
                onClick={handleAddImage}
                className="w-20 h-20 rounded-md border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Optional details */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-medium text-muted-foreground">
            Optional Details
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">🌾 Rice Type</Label>
              <Select value={riceType} onValueChange={(v) => setRiceType(v || "")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {RICE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">💰 Price/Basket (Ks)</Label>
              <Input
                type="number"
                placeholder="e.g. 12000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">📦 Quantity (baskets)</Label>
              <Input
                type="number"
                placeholder="e.g. 500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">📍 Location</Label>
              <Select value={location} onValueChange={(v) => setLocation(v || "")}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-3 border-t">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <div className="flex-1" />
        <Button type="submit" size="sm" disabled={!isValid || submitting}>
          {submitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          Post
        </Button>
      </div>
    </form>
  );
}
