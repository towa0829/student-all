"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type ShiftSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function ShiftSubmitButton({ idleLabel, pendingLabel }: ShiftSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
