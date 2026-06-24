"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { updatePost } from "@/lib/posts/actions";
import { postSchema, type PostInput } from "@/lib/validations/post";
import { ImagePlus, X, Loader2, Crown } from "lucide-react";
import { TradingFormFields } from "./trading-form-fields";
import type { Post } from "@/types";

function paddyConditionFromPost(val: unknown): number | null {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

interface EditPostFormProps {
  post: Post;
}

export function EditPostForm({ post }: EditPostFormProps) {
  const { user } = useAuth();
  const router = useRouter();
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
          region: post.region || "",
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
    formState: { errors, isSubmitting },
  } = useForm<PostInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(postSchema as any) as any,
    defaultValues: buildDefaults(),
  });

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
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    const userId = authUser?.id;
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
      formData.append("region", data.region ?? "");
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
      router.push("/feed");
      router.refresh();
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          ←
        </Button>
        <h1 className="text-base font-semibold">Edit Post</h1>
        <div className="flex-1" />
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
        {/* Content textarea */}
        <div>
          <Textarea
            placeholder="What do you want to share?"
            {...register("content")}
            className="min-h-[100px] resize-none text-sm"
            autoFocus
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
            📷 Photos <span className="font-medium">(max {maxImages})</span>
          </Label>

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

        {/* Buying / Selling fields */}
        {isPremium && (
          <TradingFormFields
            postType={postType}
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-3 border-t">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <div className="flex-1" />
        {serverError && (
          <p className="text-xs text-destructive mr-2">{serverError}</p>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!contentValue?.trim() || isSubmitting}
        >
          {isSubmitting && (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          )}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
