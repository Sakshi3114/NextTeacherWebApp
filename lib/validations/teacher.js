import { z } from "zod";

// Server-side whitelist of exactly the fields a teacher create/edit form may
// set — the old app's `PUT /api/records/[id]` applied the *entire* request
// body with no whitelist (mass assignment). Parsing every mutation through
// this schema is what fixes that class of bug for good.
export const teacherSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  departmentId: z.string().min(1, "Select a department"),
});

export const createTeacherSchema = teacherSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateTeacherSchema = teacherSchema;
