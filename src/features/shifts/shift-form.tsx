"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { ShiftSubmitButton } from "@/features/shifts/shift-submit-button";
import {
  type ShiftFormState,
  type ShiftRecord,
  initialShiftFormState
} from "@/features/shifts/types";

type ShiftFormProps = {
  action: (state: ShiftFormState, formData: FormData) => Promise<ShiftFormState>;
  description: string;
  initialShift?: ShiftRecord;
  pendingLabel: string;
  submitLabel: string;
  title: string;
};

export function ShiftForm({
  action,
  description,
  initialShift,
  pendingLabel,
  submitLabel,
  title
}: ShiftFormProps) {
  const [state, formAction] = useActionState(action, initialShiftFormState);

  return (
    <Panel className="space-y-6 border-slate-200 bg-white">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </div>

      <form action={formAction} className="space-y-4">
        {initialShift ? <input name="shiftId" type="hidden" value={initialShift.id} /> : null}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="shift-date">
            勤務日
          </label>
          <Input defaultValue={initialShift?.date ?? ""} id="shift-date" name="date" required type="date" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="shift-start-time">
              開始時刻
            </label>
            <Input
              defaultValue={initialShift?.start_time.slice(0, 5) ?? ""}
              id="shift-start-time"
              name="startTime"
              required
              type="time"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="shift-end-time">
              終了時刻
            </label>
            <Input
              defaultValue={initialShift?.end_time.slice(0, 5) ?? ""}
              id="shift-end-time"
              name="endTime"
              required
              type="time"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="shift-hourly-wage">
            時給（円）
          </label>
          <Input
            defaultValue={initialShift?.hourly_wage ?? ""}
            id="shift-hourly-wage"
            min={0}
            name="hourlyWage"
            required
            step={1}
            type="number"
          />
        </div>

        {state.type === "error" ? (
          <p className="text-sm text-rose-600" role="status">
            {state.message}
          </p>
        ) : null}

        <ShiftSubmitButton idleLabel={submitLabel} pendingLabel={pendingLabel} />
      </form>
    </Panel>
  );
}
