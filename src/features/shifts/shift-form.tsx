"use client";

import { useActionState, useState } from "react";

import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { ShiftSubmitButton } from "@/features/shifts/shift-submit-button";
import {
  type JobTypeRecord,
  type ShiftFormState,
  type ShiftRecord,
  initialShiftFormState
} from "@/features/shifts/types";

type ShiftFormProps = {
  action: (state: ShiftFormState, formData: FormData) => Promise<ShiftFormState>;
  description: string;
  initialShift?: ShiftRecord;
  jobTypeFeatureEnabled: boolean;
  jobTypes: JobTypeRecord[];
  pendingLabel: string;
  submitLabel: string;
  title: string;
};

export function ShiftForm({
  action,
  description,
  initialShift,
  jobTypeFeatureEnabled,
  jobTypes,
  pendingLabel,
  submitLabel,
  title
}: ShiftFormProps) {
  const [state, formAction] = useActionState(action, initialShiftFormState);
  const [selectedJobTypeId, setSelectedJobTypeId] = useState(initialShift?.job_type_id ?? "");
  const selectedJobType = jobTypes.find((jobType) => jobType.id === selectedJobTypeId);

  return (
    <Panel className="space-y-6 border-slate-200 bg-white">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </div>

      <form action={formAction} className="space-y-4">
        {initialShift ? <input name="shiftId" type="hidden" value={initialShift.id} /> : null}
        <input name="jobTypeFeatureEnabled" type="hidden" value={jobTypeFeatureEnabled ? "true" : "false"} />
        <input name="jobTypeId" type="hidden" value={selectedJobTypeId} />
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

        {jobTypeFeatureEnabled ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="shift-job-type">
              バイト種類
            </label>
            <select
              className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              id="shift-job-type"
              onChange={(event) => setSelectedJobTypeId(event.target.value)}
              value={selectedJobTypeId}
            >
              <option value="">手入力で時給を設定</option>
              {jobTypes.map((jobType) => (
                <option key={jobType.id} value={jobType.id}>
                  {jobType.name} / {jobType.hourly_wage}円
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            接続先 DB に新しいスキーマがまだ適用されていないため、バイト種類は使えません。時給を直接入力してください。
          </div>
        )}

        {jobTypeFeatureEnabled && selectedJobType ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <p className="font-semibold">選択中: {selectedJobType.name}</p>
            <p className="mt-1">時給は {selectedJobType.hourly_wage} 円で自動入力されます。</p>
            <input name="hourlyWage" type="hidden" value={selectedJobType.hourly_wage} />
          </div>
        ) : (
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
        )}

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
