"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { updatePost } from "@/lib/posts/actions";
import { postSchema } from "@/lib/validations/post";
import { regionTownships, regionKeys } from "@/lib/mock-data";
import type { Post } from "@/types";
import { ImagePlus, X, Loader2 } from "lucide-react";

interface EditPostModalProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

const RICE_TYPES = ["soft rice", "hard rice", "Other"];

const UNITS = [
  { value: "basket", label: "Basket (တင်း)" },
  { value: "pound", label: "Pound (ပေါင်)" },
];

const PRICE_MIN = 500_000;
const PRICE_MAX = 7_500_000;
const PRICE_STEP = 5_000;

const QTY_MIN = 100;
const QTY_MAX = 100_000;
const QTY_STEP = 50;

const POUND_MIN = 92;
const POUND_MAX = 120;

function formatLakh(n: number): string {
  return `${n.toLocaleString()} Ks`;
}

export function EditPostModal({ post, open, onOpenChange, onUpdated }: EditPostModalProps) {
  const [images, setImages] = useState<string[]>(post.images.map((i) => i.url));
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track newly uploaded file paths so we can clean up on failure
  const pendingUploads = useRef<string[]>([]);

  const maxImages = post.type === "general" ? 2 : 5;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<any>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(postSchema as any) as any,
    defaultValues: {
      type: post.type,
      content: post.content,
      rice_type: post.rice_type || "",
      rice_name: post.rice_name || "",
      price: post.price ?? undefined,
      quantity: post.quantity ?? undefined,
      unit: post.unit || "basket",
      address: post.address || "",
      location: post.location || "",
      township: post.township || "",
      pound_per_bag: post.pound_per_bag ?? undefined,
      paddy_condition: post.paddy_condition || "",
      easy_to_carry: post.easy_to_carry ?? false,
    },
  });

  // Reset state when dialog opens with a new post
  useEffect(() => {
    if (open) {
      setImages(post.images.map((i) => i.url));
      setServerError("");
      reset({
        type: post.type,
        content: post.content,
        rice_type: post.rice_type || "",
        rice_name: post.rice_name || "",
        price: post.price ?? undefined,
        quantity: post.quantity ?? undefined,
        unit: post.unit || "basket",
        address: post.address || "",
        location: post.location || "",
        township: post.township || "",
        pound_per_bag: post.pound_per_bag ?? undefined,
        paddy_condition: post.paddy_condition || "",
        easy_to_carry: post.easy_to_carry ?? false,
      });
    }
  }, [open, post, reset]);

  const postType = watch("type");
  const watchedLocation = watch("location");
  const isPremium = postType === "buying" || postType === "selling";

  async function handleAddImageClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const supabase = createClient();
    const uploaded: string[] = [];
    // Use the same Supabase auth user ID as the first folder (matches RLS policy)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;
    if (!userId) {
      setUploading(false);
      return;
    }

    for (const file of Array.from(files).slice(0, maxImages - images.length)) {
      const ext = file.name.split(".").pop();
      // Fix #1: use correct bucket "post-images" and <user_id>/ as first folder per RLS
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from("post-images").upload(path, file);
      if (error) continue;

      const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
      uploaded.push(urlData.publicUrl);
      pendingUploads.current.push(path);
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleRemoveImage(idx: number) {
    setImages(images.filter((_, i) => i !== idx));
  }

  async function onSubmit(data: Record<string, unknown>) {
    setServerError("");

    const formData = new FormData();
    formData.set("type", String(data.type ?? ""));
    formData.set("content", String(data.content ?? ""));

    if (data.type !== "general") {
      formData.set("rice_type", String(data.rice_type ?? ""));
      formData.set("rice_name", String(data.rice_name ?? ""));
      formData.set("price", String(data.price ?? ""));
      formData.set("quantity", String(data.quantity ?? ""));
      formData.set("unit", String(data.unit ?? ""));
      formData.set("address", String(data.address ?? ""));
      formData.set("location", String(data.location ?? ""));
      formData.set("township", String(data.township ?? ""));
      formData.set("pound_per_bag", String(data.pound_per_bag ?? ""));
      formData.set("paddy_condition", String(data.paddy_condition ?? ""));
      formData.set("easy_to_carry", String(data.easy_to_carry ?? ""));
    }

    formData.set("images", images.join(","));

    const result = await updatePost(post.id, null, formData);

    if (result.success) {
      // Success — clear pending uploads since they're now referenced by post_images rows
      pendingUploads.current = [];
      onUpdated?.();
      onOpenChange(false);
    } else {
      setServerError(result.error || "Failed to update post.");
      // Fix #4: clean up orphaned newly-uploaded files on failure
      if (pendingUploads.current.length > 0) {
        const supabase = createClient();
        await supabase.storage.from("post-images").remove(pendingUploads.current);
        pendingUploads.current = [];
        // Revert images state to remove the failed uploads
        setImages(post.images.map((i) => i.url));
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>Update your post below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Textarea
              {...register("content")}
              placeholder="What do you want to share?"
              className="min-h-[80px] resize-none text-sm"
            />
            {errors.content?.message && (
              <p className="text-xs text-destructive mt-1">{String(errors.content.message)}</p>
            )}
          </div>

          {/* Images */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              📷 Photos
            </Label>
            <div className="flex gap-2 flex-wrap">
              {images.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-16 rounded-md overflow-hidden bg-muted"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
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
                  className="w-16 h-16 rounded-md border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Buying / Selling fields */}
          {isPremium && (
            <div className="space-y-3 pt-2 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">🌾 Rice Type *</Label>
                  <Select
                    value={watch("rice_type") || ""}
                    onValueChange={(v) => setValue("rice_type", v, { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {RICE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.rice_type?.message && (
                    <p className="text-xs text-destructive">{String(errors.rice_type.message)}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">📝 Rice Name</Label>
                  <Input
                    {...register("rice_name")}
                    placeholder="e.g. Special Grade A"
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
                      value={watch("price") || PRICE_MIN}
                      onChange={(e) => setValue("price", Number(e.target.value), { shouldValidate: true })}
                      className="w-full h-2 accent-primary cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {formatLakh(watch("price") || PRICE_MIN)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">📦 Quantity</Label>
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={QTY_MIN}
                      max={QTY_MAX}
                      step={QTY_STEP}
                      value={watch("quantity") || QTY_MIN}
                      onChange={(e) => setValue("quantity", Number(e.target.value), { shouldValidate: true })}
                      className="w-full h-2 accent-primary cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {(watch("quantity") || QTY_MIN).toLocaleString()} baskets
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">📍 Region</Label>
                  <Select
                    value={watch("location") || ""}
                    onValueChange={(v) => {
                      setValue("location", v, { shouldValidate: true });
                      setValue("township", "", { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regionKeys.map((key) => (
                        <SelectItem key={key} value={key}>
                          {regionTownships[key].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">🏘️ Township</Label>
                  <Select
                    value={watch("township") || ""}
                    onValueChange={(v) => setValue("township", v, { shouldValidate: true })}
                    disabled={!watchedLocation}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder={watchedLocation ? "Select township" : "Select region first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {watchedLocation &&
                        regionTownships[watchedLocation]?.townships.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-xs">🏋️ Pounds per bag</Label>
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={POUND_MIN}
                      max={POUND_MAX}
                      step={1}
                      value={watch("pound_per_bag") || POUND_MIN}
                      onChange={(e) => setValue("pound_per_bag", Number(e.target.value), { shouldValidate: true })}
                      className="w-full h-2 accent-primary cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {(watch("pound_per_bag") || POUND_MIN)} lb
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">⚖️ Unit</Label>
                  <Select
                    value={watch("unit") || "basket"}
                    onValueChange={(v) => setValue("unit", v, { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">💧 Wet or dry?</Label>
                  <Select
                    value={watch("paddy_condition") || ""}
                    onValueChange={(v) => setValue("paddy_condition", v, { shouldValidate: true })}
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
                  {...register("address")}
                  placeholder="e.g. No. 123, Hlaingthaya, Yangon"
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={watch("easy_to_carry") ?? false}
                  onCheckedChange={(v) => setValue("easy_to_carry", v, { shouldValidate: true })}
                />
                <Label className="text-xs cursor-pointer">
                  🚚 Easy to carry / transport available
                </Label>
              </div>
            </div>
          )}

          {serverError && (
            <p className="text-xs text-destructive">{serverError}</p>
          )}

          <DialogFooter showCloseButton={false} className="!border-t-0 !bg-transparent !pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
