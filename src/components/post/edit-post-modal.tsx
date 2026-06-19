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
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { updatePost } from "@/lib/posts/actions";
import { postSchema, type PostInput } from "@/lib/validations/post";
import type { Post } from "@/types";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { TradingFormFields } from "./trading-form-fields";

interface EditPostModalProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

function paddyConditionFromPost(val: unknown): number | null {
  if (typeof val === "number") return val;
  return null;
}

export function EditPostModal({ post, open, onOpenChange, onUpdated }: EditPostModalProps) {
  const [images, setImages] = useState<string[]>(post.images.map((i) => i.url));
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploads = useRef<string[]>([]);

  const maxImages = post.type === "general" ? 2 : 5;

  const buildDefaults = (): PostInput => ({
    type: post.type,
    content: post.content,
    ...(post.type !== "general"
      ? {
          rice_type: post.rice_type || "",
          rice_name: post.rice_name || "",
          price: post.price ?? undefined,
          quantity: post.quantity ?? undefined,
          unit: post.unit || "basket",
          address: post.address || "",
          location: post.location || "",
          township: post.township || "",
          pound_per_bag: post.pound_per_bag ?? undefined,
          paddy_condition: paddyConditionFromPost(post.paddy_condition) ?? undefined,
          easy_to_carry: post.easy_to_carry ?? false,
          latitude: post.latitude ?? undefined,
          longitude: post.longitude ?? undefined,
        }
      : {}),
  }) as PostInput;

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
    defaultValues: buildDefaults(),
  });

  // Reset state when dialog opens with a new post
  useEffect(() => {
    if (open) {
      setImages(post.images.map((i) => i.url));
      setServerError("");
      reset(buildDefaults());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, post, reset]);

  const postType = watch("type");
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

  async function onSubmit(data: PostInput) {
    setServerError("");

    const formData = new FormData();
    formData.append("type", data.type);
    formData.append("content", data.content);

    if (data.type !== "general") {
      formData.append("rice_type", data.rice_type ?? "");
      formData.append("rice_name", data.rice_name ?? "");
      formData.append("price", String(data.price ?? ""));
      formData.append("quantity", String(data.quantity ?? ""));
      formData.append("unit", data.unit ?? "");
      formData.append("address", data.address ?? "");
      formData.append("location", data.location ?? "");
      formData.append("township", data.township ?? "");
      formData.append("pound_per_bag", String(data.pound_per_bag ?? ""));
      formData.append("paddy_condition", String(data.paddy_condition ?? ""));
      formData.append("easy_to_carry", String(data.easy_to_carry ?? ""));
      if (data.latitude != null)
        formData.append("latitude", String(data.latitude));
      if (data.longitude != null)
        formData.append("longitude", String(data.longitude));
    }

    formData.append("images", images.join(","));

    const result = await updatePost(post.id, null, formData);

    if (result.success) {
      pendingUploads.current = [];
      onUpdated?.();
      onOpenChange(false);
    } else {
      setServerError(result.error || "Failed to update post.");
      if (pendingUploads.current.length > 0) {
        const supabase = createClient();
        await supabase.storage.from("post-images").remove(pendingUploads.current);
        pendingUploads.current = [];
        setImages(post.images.map((i) => i.url));
      }
    }
  }

  const contentValue = watch("content");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>Update your post below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Content */}
          <div>
            <Textarea
              {...register("content")}
              placeholder="What do you want to share?"
              className="min-h-[80px] resize-none text-sm"
            />
            {errors.content?.message && (
              <p className="text-xs text-destructive mt-1">
                {errors.content.message}
              </p>
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
                  className="relative w-20 h-20 rounded-md overflow-hidden bg-muted"
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Buying / Selling fields (shared component) */}
          {isPremium && (
            <TradingFormFields
              postType={postType}
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
            />
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
            <Button
              type="submit"
              disabled={!contentValue?.trim() || isSubmitting}
            >
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
