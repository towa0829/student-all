"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { ClassSubmitButton } from "@/features/classes/class-submit-button";
import {
  type ClassFormState,
  type ClassRecord,
  dayOptions,
  initialClassFormState
} from "@/features/classes/types";

type ClassFormProps = {
  action: (state: ClassFormState, formData: FormData) => Promise<ClassFormState>;
  description: string;
  initialClass?: ClassRecord;
  pendingLabel: string;
  submitLabel: string;
  title: string;
};

export function ClassForm({
  action,
  description,
  initialClass,
  pendingLabel,
  submitLabel,
  title
}: ClassFormProps) {
  const [state, formAction] = useActionState(action, initialClassFormState);

  return (
    <Panel className="space-y-6 border-slate-200 bg-white">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </div>

      <form action={formAction} className="space-y-4">
        {initialClass ? <input name="classId" type="hidden" value={initialClass.id} /> : null}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="class-name">
            授業名
          </label>
          <Input
            defaultValue={initialClass?.name ?? ""}
            id="class-name"
            maxLength={80}
            name="name"
            placeholder="例: 情報数学"
            required
            type="text"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="class-day-of-week">
              曜日
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              defaultValue={String(initialClass?.day_of_week ?? 1)}
              id="class-day-of-week"
              name="dayOfWeek"
            >
              {dayOptions.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="class-period">
              時限
            </label>
            <Input
              defaultValue={initialClass?.period ?? ""}
              id="class-period"
              max={8}
              min={1}
              name="period"
              required
              step={1}
              type="number"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="class-room">
            教室
          </label>
          <Input
            defaultValue={initialClass?.room ?? ""}
            id="class-room"
            maxLength={80}
            name="room"
            placeholder="例: A101"
            required
            type="text"
          />
        </div>

        {state.type === "error" ? (
          <p className="text-sm text-rose-600" role="status">
            {state.message}
          </p>
        ) : null}

        <ClassSubmitButton idleLabel={submitLabel} pendingLabel={pendingLabel} />
      </form>
    </Panel>
  );
}
