import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
});

export const subjectSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  code: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("")),
  departmentId: z.string().min(1, "Select a department"),
});
