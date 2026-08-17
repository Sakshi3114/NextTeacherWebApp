"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createDepartment } from "@/lib/actions/department-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add department"}
    </Button>
  );
}

export function DepartmentForm() {
  const [state, formAction] = useActionState(createDepartment, { error: null });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 space-y-1">
        <label htmlFor="dept-name" className="text-sm font-medium">
          Department name
        </label>
        <Input id="dept-name" name="name" placeholder="e.g. Computer Science" required />
      </div>
      <SubmitButton />
      {state?.error ? <p className="w-full text-sm font-medium text-destructive">{state.error}</p> : null}
    </form>
  );
}
