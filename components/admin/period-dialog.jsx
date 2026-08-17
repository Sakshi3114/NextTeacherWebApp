"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { createPeriod, updatePeriod } from "@/lib/actions/period-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PeriodForm } from "@/components/forms/period-form";

// One dialog component for both "Add period" (no `period` prop) and "Edit
// period" (pass the existing period) — same pattern as TeacherForm's
// create/edit modes, just presented as a modal instead of a page.
export function PeriodDialog({ teachers, subjects, period, defaultTeacherId }) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(period);

  const action = isEdit ? updatePeriod.bind(null, period.id) : createPeriod;
  const defaultValues = isEdit
    ? {
        day: period.day,
        startTime: period.startTime,
        endTime: period.endTime,
        room: period.room ?? "",
        teacherId: period.teacherId,
        subjectId: period.subjectId,
      }
    : {
        day: "MONDAY",
        startTime: "",
        endTime: "",
        room: "",
        teacherId: defaultTeacherId ?? "",
        subjectId: "",
      };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" aria-label="Edit period">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add period
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit period" : "Add a period"}</DialogTitle>
        </DialogHeader>
        <PeriodForm
          teachers={teachers}
          subjects={subjects}
          defaultValues={defaultValues}
          action={action}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
