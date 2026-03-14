import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, LogOut } from "lucide-react";

import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
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

function getMonthSummary(
  assignments: AssignmentRecord[],
  shifts: ShiftRecord[],
  tasks: TaskRecord[]
) {
  return {
    assignments: assignments.length,
    completedAssignments: assignments.filter((item) => item.status === "completed").length,
    shifts: shifts.length,
    tasks: tasks.length
  };
}

export function CalendarPage({
  assignments,
  classes,
  currentMonth,
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
  const summary = getMonthSummary(assignments, shifts, tasks);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-120 bg-[radial-gradient(circle_at_top_left,rgba(29,153,102,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_25%),linear-gradient(180deg,#effcf5_0%,#f8fafc_56%,#eef2ff_100%)]" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <header className="flex flex-col gap-5 rounded-4xl border border-white/70 bg-white/80 px-8 py-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
              <CalendarDays className="size-4" />
              Calendar Overview
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">カレンダー</h1>
              <p className="text-sm leading-7 text-slate-600 md:text-base">
                {userEmail} の授業、課題、シフト、タスクを月間ビューで確認できます。
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-brand-700">
              <Link href="/assignments">課題管理へ</Link>
              <Link href="/shifts">バイト管理へ</Link>
              <Link href="/">ホームへ</Link>
            </div>
          </div>
          <form action={signOutAction}>
            <Button className="w-full md:w-auto" type="submit" variant="secondary">
              <span className="inline-flex items-center gap-2">
                <LogOut className="size-4" />
                ログアウト
              </span>
            </Button>
          </form>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
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

          <div className="space-y-6">
            <Panel className="space-y-4 bg-slate-950 text-slate-50">
              <h2 className="text-xl font-semibold">月間サマリー</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-sm text-slate-300">課題</p>
                  <p className="mt-2 text-3xl font-bold">{summary.assignments}</p>
                  <p className="mt-2 text-xs text-slate-400">完了済み {summary.completedAssignments} 件</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-sm text-slate-300">シフト</p>
                  <p className="mt-2 text-3xl font-bold">{summary.shifts}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-sm text-slate-300">タスク</p>
                  <p className="mt-2 text-3xl font-bold">{summary.tasks}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-sm text-slate-300">固定授業</p>
                  <p className="mt-2 text-3xl font-bold">{classes.length}</p>
                </div>
              </div>
            </Panel>

            <Panel className="space-y-4">
              <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
                <Clock3 className="size-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-950">表示ルール</h2>
                <p className="text-sm leading-7 text-slate-600">
                  classes は day_of_week と period から毎週の授業として展開し、assignments、shifts、tasks は保存済みの日付をそのまま表示しています。
                </p>
              </div>
              <ul className="space-y-3 text-sm leading-7 text-slate-600">
                <li className="rounded-2xl bg-slate-50 px-4 py-3">授業: 曜日と時限、教室を表示</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">課題: 締切日ベースで表示</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">シフト: 勤務時間を表示</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3">タスク: due_date があるものだけ表示</li>
              </ul>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}
