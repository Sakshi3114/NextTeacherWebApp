"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { enrollStudent, unenrollStudent } from "@/lib/actions/enrollment-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function EnrollmentToggle({ studentId, subjectId, initialEnrolled }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(checked) {
    startTransition(async () => {
      const action = checked ? enrollStudent : unenrollStudent;
      const result = await action(studentId, subjectId);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox
        checked={initialEnrolled}
        disabled={isPending}
        onCheckedChange={handleChange}
        aria-label="Toggle enrollment"
      />
      Enrolled
    </label>
  );
}
