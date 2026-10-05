"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SubstitutePicker } from "@/components/admin/substitute-picker";

// Triggered from a Calendar day cell's "N on leave" badge. Lists that
// day's on-leave teachers with their affected classes, each with a
// SubstitutePicker — same component the Leave Requests page uses.
export function DayLeaveDialog({ dateLabel, dateISO, teachersOnLeave }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Badge
          variant="secondary"
          className="w-full cursor-pointer justify-center px-1 py-0 text-[10px] hover:opacity-80"
        >
          {teachersOnLeave.length} on leave
        </Badge>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>On leave — {dateLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {teachersOnLeave.map((entry) => (
            <div key={entry.teacherId} className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-medium">{entry.teacherName}</p>
              {entry.periods.length === 0 ? (
                <p className="text-xs text-muted-foreground">No classes scheduled this day.</p>
              ) : (
                <div className="space-y-2">
                  {entry.periods.map((p) => (
                    <SubstitutePicker
                      key={p.periodId}
                      periodId={p.periodId}
                      date={dateISO}
                      subjectName={p.subjectName}
                      originalTeacherName={entry.teacherName}
                      startTime={p.startTime}
                      endTime={p.endTime}
                      current={p.current}
                      leaveRequestId={entry.leaveRequestId}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
