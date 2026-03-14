"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type ClassSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function ClassSubmitButton({ idleLabel, pendingLabel }: ClassSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
