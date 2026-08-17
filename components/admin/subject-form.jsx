"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createSubject } from "@/lib/actions/department-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add subject"}
    </Button>
  );
}

export function SubjectForm({ departments }) {
  const [state, formAction] = useActionState(createSubject, { error: null });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 space-y-1">
        <label htmlFor="subject-name" className="text-sm font-medium">
          Subject name
        </label>
        <Input id="subject-name" name="name" placeholder="e.g. Data Structures" required />
      </div>
      <div className="w-28 space-y-1">
        <label htmlFor="subject-code" className="text-sm font-medium">
          Code
        </label>
        <Input id="subject-code" name="code" placeholder="CS201" />
      </div>
      <div className="w-48 space-y-1">
        <label htmlFor="subject-department" className="text-sm font-medium">
          Department
        </label>
        <Select name="departmentId">
          <SelectTrigger id="subject-department">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SubmitButton />
      {state?.error ? <p className="w-full text-sm font-medium text-destructive">{state.error}</p> : null}
    </form>
  );
}
