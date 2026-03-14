"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type TaskSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function TaskSubmitButton({ idleLabel, pendingLabel }: TaskSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
