"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type AssignmentSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function AssignmentSubmitButton({
  idleLabel,
  pendingLabel
}: AssignmentSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
