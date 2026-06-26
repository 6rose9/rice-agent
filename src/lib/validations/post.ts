import { z } from "zod";

const baseContentSchema = z
  .string()
  .min(1, "Please enter some content")
  .max(2000, "Content must be under 2000 characters");

export const generalPostSchema = z.object({
  type: z.literal("general"),
  content: baseContentSchema,
});

export const tradingPostSchema = z.object({
  type: z.enum(["buying", "selling"]),
  content: baseContentSchema,
  rice_type: z.string().min(1, "Please select rice type"),
  rice_name: z.string().optional(),
  price: z.coerce
    .number()
    .min(500_000, "Minimum price is 5 Lakh Ks")
    .max(7_500_000, "Maximum price is 75 Lakh Ks")
    .optional(),
  quantity: z.coerce
    .number()
    .min(100, "Minimum quantity is 100 baskets")
    .max(100_000, "Maximum quantity is 100,000 baskets")
    .optional(),
  unit: z.string().optional(),
  address: z.string().min(1, "Please enter an address").optional(),
  region: z.string().optional(),
  township: z.string().optional(),
  pound_per_bag: z.coerce
    .number()
    .min(92, "Minimum is 92 lb per bag")
    .max(120, "Maximum is 120 lb per bag")
    .optional(),
  paddy_condition: z.coerce.number().min(10).max(16).optional(),
  easy_to_carry: z.coerce.boolean().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
});

export const postSchema = z.discriminatedUnion("type", [
  generalPostSchema,
  tradingPostSchema,
]);

export const reportPostSchema = z.object({
  post_id: z.string().uuid("Invalid post ID"),
  reason: z.string().max(500, "Reason must be under 500 characters").optional(),
});

export type ReportPostInput = z.infer<typeof reportPostSchema>;

export type PostInput = z.infer<typeof postSchema>;
export type GeneralPostInput = z.infer<typeof generalPostSchema>;
export type TradingPostInput = z.infer<typeof tradingPostSchema>;
