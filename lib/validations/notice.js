import { z } from "zod";

export const noticeSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  body: z.string().trim().min(3, "Notice text can't be empty").max(4000),
  expiresInDays: z.coerce.number().int().min(1).max(365).optional(),
});
