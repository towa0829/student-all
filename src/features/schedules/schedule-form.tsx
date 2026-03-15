"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { ScheduleSubmitButton } from "@/features/schedules/schedule-submit-button";
import {
  type ScheduleFormState,
  type ScheduleRecord,
  initialScheduleFormState
} from "@/features/schedules/types";

type ScheduleFormProps = {
  action: (state: ScheduleFormState, formData: FormData) => Promise<ScheduleFormState>;
  description: string;
  initialSchedule?: ScheduleRecord;
  pendingLabel: string;
  submitLabel: string;
  title: string;
};

export function ScheduleForm({
  action,
  description,
  initialSchedule,
  pendingLabel,
  submitLabel,
  title
}: ScheduleFormProps) {
  const [state, formAction] = useActionState(action, initialScheduleFormState);

  return (
    <Panel className="space-y-6 border-slate-200 bg-white">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </div>

      <form action={formAction} className="space-y-4">
        {initialSchedule ? <input name="scheduleId" type="hidden" value={initialSchedule.id} /> : null}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="schedule-title">
            タイトル
          </label>
          <Input
            defaultValue={initialSchedule?.title ?? ""}
            id="schedule-title"
            maxLength={120}
            name="title"
            placeholder="例: ゼミ発表 / 病院予約"
            required
            type="text"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="schedule-start-at">
              開始日時
            </label>
            <Input
              defaultValue={initialSchedule?.start_at ?? ""}
              id="schedule-start-at"
              name="startAt"
              required
              type="datetime-local"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="schedule-end-at">
              終了日時
            </label>
            <Input
              defaultValue={initialSchedule?.end_at ?? ""}
              id="schedule-end-at"
              name="endAt"
              required
              type="datetime-local"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="schedule-memo">
            メモ
          </label>
          <textarea
            className="flex min-h-[88px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            defaultValue={initialSchedule?.memo ?? ""}
            id="schedule-memo"
            maxLength={500}
            name="memo"
            placeholder="備考メモ（任意）"
            rows={3}
          />
        </div>

        {state.type === "error" ? (
          <p className="text-sm text-rose-600" role="status">
            {state.message}
          </p>
        ) : null}

        <ScheduleSubmitButton idleLabel={submitLabel} pendingLabel={pendingLabel} />
      </form>
    </Panel>
  );
}
