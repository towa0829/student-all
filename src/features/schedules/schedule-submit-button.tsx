"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type ScheduleSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function ScheduleSubmitButton({ idleLabel, pendingLabel }: ScheduleSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
