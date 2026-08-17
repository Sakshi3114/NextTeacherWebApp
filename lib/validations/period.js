import { z } from "zod";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:mm format, e.g. 09:00");

export const periodSchema = z
  .object({
    day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
    startTime: timeSchema,
    endTime: timeSchema,
    room: z.string().trim().max(50).optional().or(z.literal("")),
    teacherId: z.string().min(1, "Select a teacher"),
    subjectId: z.string().min(1, "Select a subject"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });
