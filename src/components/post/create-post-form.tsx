"use client";

import { useState } from "react";
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
import type { PostInput } from "@/lib/validations/post";
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
  const [postType, setPostType] = useState<PostInput["type"]>("general");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // General form state
  const [generalContent, setGeneralContent] = useState("");

  // Trading form state
  const [tradingContent, setTradingContent] = useState("");
  const [riceType, setRiceType] = useState("");
  const [riceName, setRiceName] = useState("");
  const [price, setPrice] = useState(PRICE_MIN);
  const [quantity, setQuantity] = useState(QTY_MIN);
  const [unit, setUnit] = useState("basket");
  const [location, setLocation] = useState("");
  const [township, setTownship] = useState("");
  const [address, setAddress] = useState("");
  const [easyToCarry, setEasyToCarry] = useState(false);
  const [poundPerBag, setPoundPerBag] = useState(POUND_MIN);
  const [paddyCondition, setPaddyCondition] = useState("");

  const isPremium = postType === "buying" || postType === "selling";
  const maxImages = isPremium ? 5 : 2;

  function resetForms() {
    setGeneralContent("");
    setTradingContent("");
    setRiceType("");
    setRiceName("");
    setPrice(PRICE_MIN);
    setQuantity(QTY_MIN);
    setUnit("basket");
    setLocation("");
    setTownship("");
    setAddress("");
    setEasyToCarry(false);
    setPoundPerBag(POUND_MIN);
    setPaddyCondition("");
    setImages([]);
    setErrors({});
  }

  function handleTypeChange(type: PostInput["type"]) {
    resetForms();
    setPostType(type);
  }

  function handleAddImage() {
    if (images.length >= maxImages) return;
    setImages([
      ...images,
      `/api/placeholder/400/300?text=Image+${images.length + 1}`,
    ]);
  }

  function handleRemoveImage(idx: number) {
    setImages(images.filter((_, i) => i !== idx));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (postType === "general") {
      if (!generalContent.trim()) {
        newErrors.content = "Please enter some content";
      }
    } else {
      if (!tradingContent.trim()) {
        newErrors.content = "Please enter some content";
      }
      if (!riceType) {
        newErrors.rice_type = "Please select rice type";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      resetForms();
      onSuccess?.();
    }, 800);
  }

  const currentContent =
    postType === "general" ? generalContent : tradingContent;
  const setCurrentContent =
    postType === "general" ? setGeneralContent : setTradingContent;

  return (
    <form
      onSubmit={handleSubmit}
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
            value={currentContent}
            onChange={(e) => {
              setCurrentContent(e.target.value);
              if (errors.content)
                setErrors((prev) => ({ ...prev, content: "" }));
            }}
            className="min-h-[100px] resize-none text-sm"
            autoFocus
          />
          {errors.content && (
            <p className="text-xs text-destructive mt-1">{errors.content}</p>
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
                onClick={handleAddImage}
                className="w-20 h-20 rounded-md border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <ImagePlus className="h-5 w-5" />
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
                  value={riceType}
                  onValueChange={(v) => {
                    if (v !== null) setRiceType(v);
                    if (errors.rice_type)
                      setErrors((prev) => ({ ...prev, rice_type: "" }));
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
                {errors.rice_type && (
                  <p className="text-xs text-destructive">{errors.rice_type}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">📝 Rice Name</Label>
                <Input
                  placeholder="e.g. Special Grade A"
                  value={riceName}
                  onChange={(e) => setRiceName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs">💰 Price </Label>
                <div className="space-y-1">
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={PRICE_STEP}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full h-2 accent-primary cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {formatLakh(price)}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs">
                  📦 How many do you want to {postType === "buying" ? "buy" : "sell"}?
                </Label>
                <div className="space-y-1">
                  <input
                    type="range"
                    min={QTY_MIN}
                    max={QTY_MAX}
                    step={QTY_STEP}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full h-2 accent-primary cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {quantity.toLocaleString()} baskets
                  </p>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">📍 Region</Label>
                <Select
                  value={location}
                  onValueChange={(v) => {
                    if (v !== null) {
                      setLocation(v);
                      setTownship("");
                    }
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
                  value={township}
                  onValueChange={(v) => {
                    if (v !== null) setTownship(v);
                  }}
                  disabled={!location}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder={location ? "Select township" : "Select region first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {location &&
                      regionTownships[location]?.townships.map((t) => (
                        <SelectItem key={t} value={t}>
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
                  🏋️ How many pounds per bag of paddy?
                </Label>
                <div className="space-y-1">
                  <input
                    type="range"
                    min={POUND_MIN}
                    max={POUND_MAX}
                    step={1}
                    value={poundPerBag}
                    onChange={(e) => setPoundPerBag(Number(e.target.value))}
                    className="w-full h-2 accent-primary cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {poundPerBag} lb
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">⚖️ Unit</Label>
                <Select
                  value={unit}
                  onValueChange={(v) => {
                    if (v !== null) setUnit(v);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
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
                <Label className="text-xs">
                  💧 Is the paddy wet or dry?
                </Label>
                <Select
                  value={paddyCondition}
                  onValueChange={(v) => {
                    if (v !== null) setPaddyCondition(v);
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
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={easyToCarry}
                onCheckedChange={setEasyToCarry}
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
        <Button
          type="submit"
          size="sm"
          disabled={!currentContent.trim() || submitting}
        >
          {submitting && (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          )}
          Post
        </Button>
      </div>
    </form>
  );
}
