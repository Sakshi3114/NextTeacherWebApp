"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { getSubstituteCandidates, assignSubstitute, removeSubstitute } from "@/lib/actions/substitution-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Finds and assigns a per-class substitute. Reused from both the Calendar
// day-detail dialog and the Leave Requests page — same periodId+date
// occurrence, same lib/actions/substitution-actions.js calls either way.
export function SubstitutePicker({ periodId, date, subjectName, originalTeacherName, startTime, endTime, current, leaveRequestId }) {
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState(null);
  const [selected, setSelected] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleOpenChange(nextOpen) {
    setOpen(nextOpen);
    if (nextOpen && candidates === null) {
      startTransition(async () => {
        const result = await getSubstituteCandidates(periodId, date);
        if (result?.error) {
          toast.error(result.error);
          setCandidates([]);
          return;
        }
        setCandidates(result.candidates);
      });
    }
  }

  function handleAssign() {
    if (!selected) return;
    startTransition(async () => {
      const result = await assignSubstitute({ periodId, date, substituteId: selected, leaveRequestId });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Substitute assigned and notified.");
      setOpen(false);
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeSubstitute(current.substitutionId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Substitute removed.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <div>
          <span className="font-medium">{subjectName}</span>{" "}
          <span className="text-muted-foreground">
            {startTime}–{endTime}
          </span>
        </div>
        {current ? (
          <DialogTrigger asChild>
            <Badge variant="secondary" className="cursor-pointer hover:opacity-80">
              Covered by {current.name}
            </Badge>
          </DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <UserPlus className="mr-2 h-3.5 w-3.5" /> Find substitute
            </Button>
          </DialogTrigger>
        )}
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{current ? "Change substitute" : "Find a substitute"}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {subjectName} · {originalTeacherName} · {startTime}–{endTime}
        </p>
        {candidates === null ? (
          <p className="text-sm text-muted-foreground">Checking who's free…</p>
        ) : candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No other {subjectName} teacher is free at this time — everyone qualified is already teaching or on leave.
          </p>
        ) : (
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue placeholder="Select a free teacher" />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <DialogFooter className="gap-2 sm:justify-between">
          {current ? (
            <Button type="button" variant="ghost" disabled={isPending} onClick={handleRemove}>
              Remove substitute
            </Button>
          ) : (
            <span />
          )}
          <Button type="button" disabled={isPending || !selected} onClick={handleAssign}>
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
