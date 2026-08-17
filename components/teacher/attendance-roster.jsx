"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitAttendance } from "@/lib/actions/attendance-actions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];
const STATUS_LABEL = { PRESENT: "Present", ABSENT: "Absent", LATE: "Late", EXCUSED: "Excused" };

export function AttendanceRoster({ periodId, date, students, existingStatuses }) {
  const [statuses, setStatuses] = useState(() => {
    const initial = {};
    for (const s of students) {
      initial[s.id] = existingStatuses[s.id] ?? "PRESENT";
    }
    return initial;
  });
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const records = students.map((s) => ({ studentId: s.id, status: statuses[s.id] }));
    startTransition(async () => {
      const result = await submitAttendance({ periodId, date, records });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Attendance saved.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="divide-y rounded-md border">
        {students.map((student) => (
          <div key={student.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-muted-foreground">{student.rollNumber ?? "—"}</p>
            </div>
            <Select value={statuses[student.id]} onValueChange={(v) => setStatuses((prev) => ({ ...prev, [student.id]: v }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABEL[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <Button onClick={handleSubmit} disabled={isPending}>
        {isPending ? "Saving..." : "Save attendance"}
      </Button>
    </div>
  );
}
