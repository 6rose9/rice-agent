import { z } from "zod";

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be under 1000 characters"),
});

export type CommentInput = z.infer<typeof commentSchema>;
