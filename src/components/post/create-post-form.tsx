"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { createPost } from "@/lib/posts/actions";
import { postSchema, type PostInput } from "@/lib/validations/post";
import { regionTownships, regionKeys } from "@/lib/mock-data";
import { ImagePlus, X, Loader2, Crown } from "lucide-react";

interface CreatePostFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RICE_TYPES = ["soft rice", "hard rice", "Other"];

const UNITS = [
  { value: "basket", label: "Basket (တင်း)" },
  { value: "pound", label: "Pound (ပေါင်)" },
];

const PRICE_MIN = 500_000; // 5 lakh
const PRICE_MAX = 7_500_000; // 75 lakh
const PRICE_STEP = 5_000;

const QTY_MIN = 100;
const QTY_MAX = 100_000;
const QTY_STEP = 50;

const POUND_MIN = 92;
const POUND_MAX = 120;

function formatLakh(n: number): string {
  return `${n.toLocaleString()} Ks`;
}

export function CreatePostForm({ onSuccess, onCancel }: CreatePostFormProps) {
  const { user } = useAuth();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Fix #4: track newly uploaded file paths for cleanup on failure
  const pendingUploads = useRef<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(postSchema as any) as any,
    defaultValues: {
      type: "general",
      content: "",
    },
  });

  const postType = watch("type");
  const watchedLocation = watch("location");
  const isPremium = postType === "buying" || postType === "selling";
  const maxImages = isPremium ? 5 : 2;

  function handleTypeChange(type: PostInput["type"]) {
    reset({
      type,
      content: "",
    } as PostInput);
    setImages([]);
    setServerError("");
  }

  // ── Image Upload ────────────────────────────────────────────────────

  async function handleAddImageClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = maxImages - images.length;
    const toUpload = Array.from(files).slice(0, remaining);

    if (toUpload.length === 0) return;

    setUploading(true);
    const supabase = createClient();

    for (const file of toUpload) {
      try {
        const filePath = `${user?.user.id}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const { data, error } = await supabase.storage
          .from("post-images")
          .upload(filePath, file);

        if (error) {
          console.error("Upload failed:", error.message);
          continue;
        }

        // Track path for potential cleanup on failure (fix #4)
        pendingUploads.current.push(data.path);

        const { data: urlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(data.path);

        setImages((prev) => [...prev, urlData.publicUrl]);
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    setUploading(false);

    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleRemoveImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Submit ──────────────────────────────────────────────────────────

  async function onSubmit(data: PostInput) {
    setServerError("");

    const formData = new FormData();
    formData.append("type", data.type);
    formData.append("content", data.content);

    if (data.type !== "general") {
      if (data.rice_type) formData.append("rice_type", data.rice_type);
      if (data.rice_name) formData.append("rice_name", data.rice_name);
      if (data.price != null) formData.append("price", String(data.price));
      if (data.quantity != null)
        formData.append("quantity", String(data.quantity));
      if (data.unit) formData.append("unit", data.unit);
      if (data.address) formData.append("address", data.address);
      if (data.location) formData.append("location", data.location);
      if (data.township) formData.append("township", data.township);
      if (data.pound_per_bag != null)
        formData.append("pound_per_bag", String(data.pound_per_bag));
      if (data.paddy_condition)
        formData.append("paddy_condition", data.paddy_condition);
      if (data.easy_to_carry != null)
        formData.append("easy_to_carry", String(data.easy_to_carry));
    }

    // Image URLs as comma-separated string
    if (images.length > 0) {
      formData.append("images", images.join(","));
    }

    const result = await createPost({ success: false }, formData);

    if (!result.success) {
      setServerError(result.error || "Failed to create post.");
      // Fix #4: clean up orphaned uploads on failure
      if (pendingUploads.current.length > 0) {
        const supabase = createClient();
        await supabase.storage.from("post-images").remove(pendingUploads.current);
        pendingUploads.current = [];
        setImages([]);
      }
      return;
    }

    // Success — pending uploads are now referenced by post_images rows
    pendingUploads.current = [];
    reset();
    setImages([]);
    onSuccess?.();
  }

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-accent">
            {user?.profile.full_name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {user?.profile.full_name || "You"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Posting as {user?.profile.role || "General User"}
          </p>
        </div>
        <Badge
          variant={
            postType === "general"
              ? "outline"
              : postType === "selling"
                ? "default"
                : "secondary"
          }
          className="text-xs gap-1"
        >
          {isPremium && <Crown className="h-3 w-3" />}
          {postType === "general"
            ? "📝 General"
            : postType === "selling"
              ? "🛒 Selling"
              : "💰 Buying"}
        </Badge>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Post type selector */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={postType === "general" ? "default" : "outline"}
            className="flex-1"
            size="sm"
            onClick={() => handleTypeChange("general")}
          >
            📝 General
          </Button>
          <div className="relative flex-1">
            <Button
              type="button"
              variant={postType === "selling" ? "default" : "outline"}
              className="w-full"
              size="sm"
              onClick={() => handleTypeChange("selling")}
            >
              🛒 Selling
            </Button>
            {postType === "selling" && (
              <Badge
                variant="default"
                className="absolute -top-2 -right-2 h-4 text-[8px] px-1 gap-0.5"
              >
                <Crown className="h-2.5 w-2.5" />
                PRO
              </Badge>
            )}
          </div>
          <div className="relative flex-1">
            <Button
              type="button"
              variant={postType === "buying" ? "default" : "outline"}
              className="w-full"
              size="sm"
              onClick={() => handleTypeChange("buying")}
            >
              💰 Buying
            </Button>
            {postType === "buying" && (
              <Badge
                variant="default"
                className="absolute -top-2 -right-2 h-4 text-[8px] px-1 gap-0.5"
              >
                <Crown className="h-2.5 w-2.5" />
                PRO
              </Badge>
            )}
          </div>
        </div>

        {/* Premium upsell for non-subscribers */}
        {isPremium && (
          <div className="flex items-center gap-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
            <Crown className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              Buying & Selling posts are for{" "}
              <span className="font-semibold">Pro subscribers</span>. Upgrade to
              unlock unlimited listings with up to 5 images.
            </p>
          </div>
        )}

        {/* Content textarea */}
        <div>
          <Textarea
            placeholder={
              postType === "general"
                ? "What do you want to share with the rice community?"
                : "Describe what you want to buy/sell..."
            }
            {...register("content")}
            className="min-h-[100px] resize-none text-sm"
            autoFocus
          />
          {errors.content && (
            <p className="text-xs text-destructive mt-1">
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Images */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            📷 Add Photos <span className="font-medium">(max {maxImages})</span>
            {isPremium && (
              <span className="text-amber-500 ml-1">
                <Crown className="h-2.5 w-2.5 inline" />
              </span>
            )}
          </Label>

          {/* Hidden file input for real uploads */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex gap-2 flex-wrap">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded-md overflow-hidden bg-muted"
              >
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
            {images.length < maxImages && (
              <button
                type="button"
                onClick={handleAddImageClick}
                disabled={uploading}
                className="w-20 h-20 rounded-md border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImagePlus className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Buying / Selling extra fields */}
        {isPremium && (
          <div className="space-y-3 pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground">
              📋 Listing Details
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">🌾 Rice Type *</Label>
                <Select
                  value={watch("rice_type") ?? ""}
                  onValueChange={(v) => {
                    if (v) setValue("rice_type", v, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select rice type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RICE_TYPES.map((t) => (
                      <SelectItem
                        key={t}
                        value={t}
                      >
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* eslint-disable @typescript-eslint/no-explicit-any */}
                {(errors as any).rice_type && (
                  <p className="text-xs text-destructive">
                    {(errors as any).rice_type.message}
                  </p>
                )}
                {/* eslint-enable @typescript-eslint/no-explicit-any */}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">📝 Rice Name</Label>
                <Input
                  placeholder="e.g. Special Grade A"
                  {...register("rice_name")}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs">💰 Price</Label>
                <div className="space-y-1">
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={PRICE_STEP}
                    value={watch("price") ?? PRICE_MIN}
                    onChange={(e) =>
                      setValue("price", Number(e.target.value), {
                        shouldValidate: true,
                      })
                    }
                    className="w-full h-2 accent-primary cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {formatLakh(watch("price") ?? PRICE_MIN)}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs">
                  📦 How many do you want to{" "}
                  {postType === "buying" ? "buy" : "sell"}?
                </Label>
                <div className="space-y-1">
                  <input
                    type="range"
                    min={QTY_MIN}
                    max={QTY_MAX}
                    step={QTY_STEP}
                    value={watch("quantity") ?? QTY_MIN}
                    onChange={(e) =>
                      setValue("quantity", Number(e.target.value), {
                        shouldValidate: true,
                      })
                    }
                    className="w-full h-2 accent-primary cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {(watch("quantity") ?? QTY_MIN).toLocaleString()} baskets
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">📍 Region</Label>
                <Select
                  value={watch("location") ?? ""}
                  onValueChange={(v) => {
                    if (v) {
                      setValue("location", v, { shouldValidate: true });
                      setValue("township", "", { shouldValidate: false });
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionKeys.map((key) => (
                      <SelectItem
                        key={key}
                        value={key}
                      >
                        {regionTownships[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">🏘️ Township</Label>
                <Select
                  value={watch("township") ?? ""}
                  onValueChange={(v) => {
                    if (v) setValue("township", v, { shouldValidate: true });
                  }}
                  disabled={!watchedLocation}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue
                      placeholder={
                        watchedLocation
                          ? "Select township"
                          : "Select region first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {watchedLocation &&
                      regionTownships[watchedLocation]?.townships.map((t) => (
                        <SelectItem
                          key={t}
                          value={t}
                        >
                          {t}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs">
                  How many pounds per bag of paddy?
                </Label>
                <div className="space-y-1">
                  <input
                    type="range"
                    min={POUND_MIN}
                    max={POUND_MAX}
                    step={1}
                    value={watch("pound_per_bag") ?? POUND_MIN}
                    onChange={(e) =>
                      setValue("pound_per_bag", Number(e.target.value), {
                        shouldValidate: true,
                      })
                    }
                    className="w-full h-2 accent-primary cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {watch("pound_per_bag") ?? POUND_MIN} lb
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">⚖️ Unit</Label>
                <Select
                  value={watch("unit") ?? ""}
                  onValueChange={(v) => {
                    if (v) setValue("unit", v, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="h-9 text-xs min-w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem
                        key={u.value}
                        value={u.value}
                      >
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">🌾 Is the paddy wet or dry?</Label>
                <Select
                  value={watch("paddy_condition") ?? ""}
                  onValueChange={(v) => {
                    if (v)
                      setValue("paddy_condition", v as "dry" | "wet", {
                        shouldValidate: true,
                      });
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dry">Dry</SelectItem>
                    <SelectItem value="wet">Wet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">🏠 Address</Label>
              <Input
                placeholder="e.g. No. 123, Hlaingthaya, Yangon"
                {...register("address")}
                className="h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={watch("easy_to_carry") ?? false}
                onCheckedChange={(checked) =>
                  setValue("easy_to_carry", checked, { shouldValidate: true })
                }
              />
              <Label className="text-xs cursor-pointer">
                🚚 Easy to carry / transport available
              </Label>
            </div>
          </div>
        )}
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
        {!watch("content")?.trim() && !serverError && (
          <p className="text-xs text-muted-foreground mr-2">Enter some content to post</p>
        )}
        {serverError && (
          <p className="text-xs text-destructive mr-2">{serverError}</p>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!watch("content")?.trim() || isSubmitting}
        >
          {isSubmitting && (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          )}
          Post
        </Button>
      </div>
    </form>
  );
}
