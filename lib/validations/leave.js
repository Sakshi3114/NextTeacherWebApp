import { z } from "zod";

export const leaveRequestSchema = z
  .object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid start date"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid end date"),
    reason: z.string().trim().min(5, "Give a brief reason (at least 5 characters)").max(500),
    substituteId: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });
