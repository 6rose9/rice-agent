"use client";

import dynamic from "next/dynamic";
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
import { useRegions } from "@/hooks/use-regions";

const LocationPicker = dynamic(
  () => import("@/components/post/location-picker").then((mod) => mod.LocationPicker),
  { ssr: false }
);
import {
  RICE_TYPES,
  MEASURING,
  PRICE_MIN,
  PRICE_MAX,
  PRICE_STEP,
  QTY_MIN,
  QTY_MAX,
  QTY_STEP,
  POUND_MIN,
  POUND_MAX,
  formatLakh,
} from "./post-form-constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TradingFormFieldsProps {
  postType: "buying" | "selling";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
}

export function TradingFormFields({
  postType,
  register,
  watch,
  setValue,
  errors,
}: TradingFormFieldsProps) {
  const watchedLocation = watch("region");
  const { regions, getTownshipsForRegion, loading } = useRegions();

  // Find selected region ID from the stored English name
  const selectedRegion = regions.find((r) => r.name.en === watchedLocation);
  const townships = selectedRegion
    ? getTownshipsForRegion(selectedRegion.id)
    : [];

  return (
    <div className="space-y-3 pt-4 border-t">
      <p className="text-xs font-medium text-muted-foreground">
        📋 Listing Details
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Rice Type */}
        <div className="space-y-1.5">
          <Label className="text-xs">🌾 Rice Type *</Label>
          <Select
            value={watch("rice_type") ?? ""}
            onValueChange={(v) => {
              if (v) setValue("rice_type", v, { shouldValidate: true });
            }}
          >
            <SelectTrigger className="h-9 text-xs min-w-[300px]">
              <SelectValue placeholder="Select rice type" />
            </SelectTrigger>
            <SelectContent>
              {RICE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(errors as any).rice_type && (
            <p className="text-xs text-destructive">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(errors as any).rice_type.message}
            </p>
          )}
        </div>

        {/* Rice Name */}
        <div className="space-y-1.5">
          <Label className="text-xs">📝 Rice Name</Label>
          <Input
            placeholder="e.g. Special Grade A"
            {...register("rice_name")}
            className="h-9 text-xs"
          />
        </div>

        {/* Price Slider */}
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs">💰 Approximate Price</Label>
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

        {/* Quantity Slider */}
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs">
            📦 How many do you want to {postType === "buying" ? "buy" : "sell"}?
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

      {/* Region / Township */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">📍 Region</Label>
          <Select
            value={watch("region") ?? ""}
            onValueChange={(v) => {
              if (v) {
                setValue("region", v, { shouldValidate: true });
                setValue("township", "", { shouldValidate: false });
              }
            }}
            disabled={loading}
          >
            <SelectTrigger className="h-9 text-xs min-w-[300px]">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r.id} value={r.name.en}>
                  {r.name.en}
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
            disabled={!watchedLocation || loading}
          >
            <SelectTrigger className="h-9 text-xs min-w-[300px]">
              <SelectValue
                placeholder={
                  watchedLocation
                    ? "Select township"
                    : "Select region first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {townships.map((t) => (
                <SelectItem key={t.id} value={t.name.en}>
                  {t.name.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pound per bag + Measuring */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5 md:col-span-2">
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
          <Label className="text-xs">⚖️ Measuring Instrument</Label>
          <Select
            value={watch("unit") ?? ""}
            onValueChange={(v) => {
              if (v) setValue("unit", v, { shouldValidate: true });
            }}
          >
            <SelectTrigger className="h-9 text-xs min-w-[300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEASURING.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Moisture Level (paddy_condition as range slider) */}
        <div className="space-y-1.5">
          <Label className="text-xs">☀️ Moisture Level</Label>
          <div className="space-y-1">
            <input
              type="range"
              min={10}
              max={16}
              step={0.1}
              value={watch("paddy_condition") ?? 10}
              onChange={(e) =>
                setValue("paddy_condition", Number(e.target.value), {
                  shouldValidate: true,
                })
              }
              className="w-full h-2 cursor-pointer rounded-full appearance-none"
              style={{
                background: `linear-gradient(to right, #22c55e 0%, #84cc16 25%, #eab308 50%, #f97316 75%, #ef4444 100%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span className="text-green-500 font-medium">Wet (10)</span>
              <span className="text-yellow-500 font-medium">14</span>
              <span className="text-orange-500 font-medium">Dry (16)</span>
            </div>
            <p className="text-xs text-muted-foreground text-center font-medium">
              {watch("paddy_condition") ?? 10}%
            </p>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
          <Label className="text-xs">🏠 Address</Label>
        <Input
          placeholder="e.g. No. 123, Hlaingthaya, Yangon"
          {...register("address")}
          className="h-9 text-xs"
        />
      </div>

      {/* Pin Location */}
      <div className="space-y-1.5">
          <Label className="text-xs">📍 Pin Location</Label>
        <LocationPicker
          value={
            watch("latitude") != null && watch("longitude") != null
              ? { lat: watch("latitude")!, lng: watch("longitude")! }
              : null
          }
          onChange={(loc) => {
            if (loc) {
              setValue("latitude", loc.lat, { shouldValidate: true });
              setValue("longitude", loc.lng, { shouldValidate: true });
            } else {
              setValue("latitude", null, { shouldValidate: true });
              setValue("longitude", null, { shouldValidate: true });
            }
          }}
        />
        <input type="hidden" {...register("latitude")} />
        <input type="hidden" {...register("longitude")} />
      </div>

      {/* Easy to carry */}
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
  );
}
