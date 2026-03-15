"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { createShiftFromCalendarAction } from "@/actions/calendar";
import { Button } from "@/components/ui/button";

type JobType = { id: string; name: string; hourly_wage: number };

type Props = {
  addDate: string;
  jobTypes: JobType[];
  monthParam: string;
};

export function CreateShiftForm({ addDate, jobTypes, monthParam }: Props) {
  const defaultWage = jobTypes.length > 0 ? jobTypes[0].hourly_wage : 1000;
  const [wage, setWage] = useState(defaultWage);
  const formRef = useRef<HTMLFormElement>(null);

  function handleJobTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = jobTypes.find((jt) => jt.id === e.target.value);
    if (selected) {
      setWage(selected.hourly_wage);
    }
  }

  return (
    <div className="space-y-4">
      <form action={createShiftFromCalendarAction} className="space-y-4" id="create-shift-form" ref={formRef}>
        <input name="month" type="hidden" value={monthParam} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="new-shift-date">勤務日</label>
          <input
            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            defaultValue={addDate}
            id="new-shift-date"
            name="date"
            required
            type="date"
          />
        </div>
        {jobTypes.length > 0 ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="new-shift-job-type">勤務先</label>
            <select
              className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              id="new-shift-job-type"
              name="jobTypeId"
              onChange={handleJobTypeChange}
            >
              <option value="">選択しない</option>
              {jobTypes.map((jt) => (
                <option key={jt.id} value={jt.id}>{jt.name}</option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="new-shift-start">開始時刻</label>
            <input
              className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              id="new-shift-start"
              name="startTime"
              required
              type="time"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="new-shift-end">終了時刻</label>
            <input
              className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              id="new-shift-end"
              name="endTime"
              required
              type="time"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="new-shift-wage">時給（円）</label>
          <input
            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            id="new-shift-wage"
            min={0}
            name="hourlyWage"
            onChange={(e) => setWage(Number(e.target.value))}
            required
            type="number"
            value={wage}
          />
        </div>
      </form>
      <div className="flex items-center gap-2">
        <Button form="create-shift-form" type="submit">追加</Button>
        <Link className="text-sm font-semibold text-slate-500 hover:text-slate-700" href={`/calendar?month=${monthParam}&addDate=${addDate}`}>戻る</Link>
      </div>
    </div>
  );
}
