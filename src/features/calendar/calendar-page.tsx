import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { signOutAction } from "@/actions/auth";
import { FeatureHeader } from "@/components/layout/feature-header";
import { Panel } from "@/components/ui/panel";
import type { Database } from "@/types/supabase";

type AssignmentRecord = Database["public"]["Tables"]["assignments"]["Row"];
type ShiftRecord = Database["public"]["Tables"]["shifts"]["Row"];
type TaskRecord = Database["public"]["Tables"]["tasks"]["Row"];
type ClassRecord = Database["public"]["Tables"]["classes"]["Row"];

type CalendarEvent = {
  id: string;
  type: "class" | "assignment" | "shift" | "task";
  title: string;
  detail: string;
};

type CalendarPageProps = {
  assignments: AssignmentRecord[];
  classes: ClassRecord[];
  currentMonth: Date;
  dataWarning?: string | null;
  shifts: ShiftRecord[];
  tasks: TaskRecord[];
  userEmail: string | null;
};

const dayLabels = ["日", "月", "火", "水", "木", "金", "土"] as const;

const eventStyle: Record<CalendarEvent["type"], string> = {
  assignment: "border-amber-200 bg-amber-50 text-amber-800",
  class: "border-sky-200 bg-sky-50 text-sky-800",
  shift: "border-emerald-200 bg-emerald-50 text-emerald-800",
  task: "border-violet-200 bg-violet-50 text-violet-800"
};

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildMonthGrid(currentMonth: Date) {
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const gridStart = new Date(monthStart);
  const gridEnd = new Date(monthEnd);

  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  gridEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));

  const days: Date[] = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return { days, gridEnd, gridStart, monthEnd, monthStart };
}

function getClassOccurrences(classes: ClassRecord[], days: Date[]) {
  const events = new Map<string, CalendarEvent[]>();

  classes.forEach((schoolClass) => {
    days.forEach((day) => {
      if (day.getDay() !== schoolClass.day_of_week) {
        return;
      }

      const key = formatDateKey(day);
      const current = events.get(key) ?? [];

      current.push({
        id: `${schoolClass.id}-${key}`,
        type: "class",
        title: schoolClass.name,
        detail: `${schoolClass.period}限 ${schoolClass.room}`
      });

      events.set(key, current);
    });
  });

  return events;
}

function mergeEvents(
  days: Date[],
  assignments: AssignmentRecord[],
  classes: ClassRecord[],
  shifts: ShiftRecord[],
  tasks: TaskRecord[]
) {
  const events = getClassOccurrences(classes, days);

  assignments.forEach((assignment) => {
    const current = events.get(assignment.due_date) ?? [];

    current.push({
      id: assignment.id,
      type: "assignment",
      title: assignment.title,
      detail: assignment.status === "completed" ? "課題完了" : "締切"
    });

    events.set(assignment.due_date, current);
  });

  shifts.forEach((shift) => {
    const current = events.get(shift.date) ?? [];

    current.push({
      id: shift.id,
      type: "shift",
      title: "バイトシフト",
      detail: `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`
    });

    events.set(shift.date, current);
  });

  tasks.forEach((task) => {
    if (!task.due_date) {
      return;
    }

    const current = events.get(task.due_date) ?? [];

    current.push({
      id: task.id,
      type: "task",
      title: task.title,
      detail: task.status === "completed" ? "タスク完了" : "タスク締切"
    });

    events.set(task.due_date, current);
  });

  return events;
}

function createMonthLink(currentMonth: Date, offset: number) {
  const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
  const month = String(next.getMonth() + 1).padStart(2, "0");

  return `/calendar?month=${next.getFullYear()}-${month}`;
}

export function CalendarPage({
  assignments,
  classes,
  currentMonth,
  dataWarning,
  shifts,
  tasks,
  userEmail
}: CalendarPageProps) {
  const { days } = buildMonthGrid(currentMonth);
  const eventsByDate = mergeEvents(days, assignments, classes, shifts, tasks);
  const monthFormatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long"
  });

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-120 bg-[radial-gradient(circle_at_top_left,rgba(29,153,102,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_25%),linear-gradient(180deg,#effcf5_0%,#f8fafc_56%,#eef2ff_100%)]" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <FeatureHeader
          signOutAction={signOutAction}
          userLabel={userEmail ?? "ユーザー"}
        />

        {dataWarning ? (
          <Panel className="border-amber-200 bg-amber-50">
            <p className="text-sm font-medium text-amber-800">{dataWarning}</p>
          </Panel>
        ) : null}

        <section className="grid gap-6">
          <Panel className="space-y-6 border-slate-200 bg-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">対象月</p>
                <h2 className="text-2xl font-semibold text-slate-950">{monthFormatter.format(currentMonth)}</h2>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  href={createMonthLink(currentMonth, -1)}
                >
                  <ChevronLeft className="size-4" />
                  前月
                </Link>
                <Link
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  href={createMonthLink(currentMonth, 1)}
                >
                  次月
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {dayLabels.map((label) => (
                <div className="rounded-2xl px-2 py-2" key={label}>
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
              {days.map((day) => {
                const key = formatDateKey(day);
                const dayEvents = eventsByDate.get(key) ?? [];
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

                return (
                  <div
                    className={
                      isCurrentMonth
                        ? "min-h-40 rounded-3xl border border-slate-200 bg-slate-50/80 p-3"
                        : "min-h-40 rounded-3xl border border-slate-100 bg-slate-50/30 p-3 opacity-55"
                    }
                    key={key}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">{day.getDate()}</span>
                      {dayEvents.length > 0 ? (
                        <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-bold text-white">
                          {dayEvents.length}
                        </span>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          className={`rounded-2xl border px-2 py-2 text-[11px] leading-5 ${eventStyle[event.type]}`}
                          key={event.id}
                        >
                          <p className="font-semibold">{event.title}</p>
                          <p>{event.detail}</p>
                        </div>
                      ))}
                      {dayEvents.length > 3 ? (
                        <p className="text-[11px] font-semibold text-slate-500">
                          +{dayEvents.length - 3} 件の予定
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}
