"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { decideLeave } from "@/lib/actions/leave-actions";
import { Button } from "@/components/ui/button";

export function LeaveDecisionButtons({ leaveRequestId }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function decide(decision) {
    startTransition(async () => {
      const result = await decideLeave(leaveRequestId, decision);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Leave request ${decision.toLowerCase()}.`);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => decide("REJECTED")}>
        Reject
      </Button>
      <Button size="sm" disabled={isPending} onClick={() => decide("APPROVED")}>
        Approve
      </Button>
    </div>
  );
}
