import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Pencil, RotateCcw, Trash2 } from "lucide-react";

import {
  deleteAssignmentAction,
  toggleAssignmentStatusAction
} from "@/actions/assignments";
import { signOutAction } from "@/actions/auth";
import { deleteShiftAction } from "@/actions/shifts";
import { deleteTaskAction, toggleTaskStatusAction } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
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
  dateKey: string;
  editHref?: string;
  isCompleted: boolean;
  status?: "pending" | "completed";
};

type UpcomingItem = {
  id: string;
  title: string;
  due_date: string;
  status: string;
};

type CalendarPageProps = {
  assignments: AssignmentRecord[];
  classes: ClassRecord[];
  currentMonth: Date;
  dataWarning?: string | null;
  shifts: ShiftRecord[];
  tasks: TaskRecord[];
  upcomingAssignments: UpcomingItem[];
  upcomingTasks: UpcomingItem[];
  userEmail: string | null;
};

const dayLabels = ["日", "月", "火", "水", "木", "金", "土"] as const;
const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0
});

const baseEventStyle: Record<CalendarEvent["type"], string> = {
  assignment: "border-amber-200 bg-amber-50 text-amber-800",
  class: "border-sky-200 bg-sky-50 text-sky-800",
  shift: "border-emerald-200 bg-emerald-50 text-emerald-800",
  task: "border-violet-200 bg-violet-50 text-violet-800"
};

function getEventStyle(event: CalendarEvent) {
  if ((event.type === "assignment" || event.type === "task") && event.isCompleted) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  return baseEventStyle[event.type];
}

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
        dateKey: key,
        type: "class",
        title: schoolClass.name,
        detail: `${schoolClass.period}限 ${schoolClass.room}`,
        isCompleted: false
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
      dateKey: assignment.due_date,
      editHref: `/assignments?edit=${assignment.id}`,
      type: "assignment",
      title: assignment.title,
      detail: "課題締切",
      isCompleted: assignment.status === "completed",
      status: assignment.status
    });

    events.set(assignment.due_date, current);
  });

  shifts.forEach((shift) => {
    const current = events.get(shift.date) ?? [];

    current.push({
      id: shift.id,
      dateKey: shift.date,
      editHref: `/shifts?edit=${shift.id}&month=${shift.date.slice(0, 7)}`,
      type: "shift",
      title: "バイトシフト",
      detail: `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`,
      isCompleted: false
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
      dateKey: task.due_date,
      editHref: `/tasks?edit=${task.id}`,
      type: "task",
      title: task.title,
      detail: "タスク締切",
      isCompleted: task.status === "completed",
      status: task.status
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
  upcomingAssignments,
  upcomingTasks,
  userEmail
}: CalendarPageProps) {
  const { days } = buildMonthGrid(currentMonth);
  const eventsByDate = mergeEvents(days, assignments, classes, shifts, tasks);
  const upcomingItems = [...upcomingAssignments, ...upcomingTasks].sort((a, b) =>
    a.due_date.localeCompare(b.due_date)
  );
  const monthlyShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.date);

    return (
      shiftDate.getFullYear() === currentMonth.getFullYear() &&
      shiftDate.getMonth() === currentMonth.getMonth()
    );
  });
  const monthlyHours = monthlyShifts.reduce((acc, shift) => {
    const [startHour, startMinute] = shift.start_time.split(":").map(Number);
    const [endHour, endMinute] = shift.end_time.split(":").map(Number);

    return acc + (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
  }, 0);
  const monthlyPay = monthlyShifts.reduce((acc, shift) => {
    const [startHour, startMinute] = shift.start_time.split(":").map(Number);
    const [endHour, endMinute] = shift.end_time.split(":").map(Number);
    const duration = (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;

    return acc + duration * shift.hourly_wage;
  }, 0);
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

        <section className="grid gap-6 md:items-start md:grid-cols-[minmax(0,1fr),320px]">
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
                      {dayEvents.slice(0, 4).map((event) => (
                        <div
                          className={`rounded-2xl border px-2 py-2 text-[11px] leading-5 ${getEventStyle(event)}`}
                          key={event.id}
                        >
                          <p className="flex items-center gap-1 font-semibold">
                            {event.isCompleted ? <Check className="size-3" /> : null}
                            {event.title}
                          </p>
                          <p>{event.detail}</p>
                          {event.type === "assignment" ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              <form action={toggleAssignmentStatusAction}>
                                <input name="assignmentId" type="hidden" value={event.id} />
                                <input name="currentStatus" type="hidden" value={event.status} />
                                <Button className="px-2 py-1 text-[10px]" type="submit" variant="secondary">
                                  {event.isCompleted ? <RotateCcw className="size-3" /> : <Check className="size-3" />}
                                </Button>
                              </form>
                              <Link
                                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-slate-800"
                                href={event.editHref ?? "/assignments"}
                              >
                                <Pencil className="size-3" />
                              </Link>
                              <form action={deleteAssignmentAction}>
                                <input name="assignmentId" type="hidden" value={event.id} />
                                <Button className="px-2 py-1 text-[10px]" type="submit" variant="ghost">
                                  <Trash2 className="size-3" />
                                </Button>
                              </form>
                            </div>
                          ) : null}
                          {event.type === "task" ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              <form action={toggleTaskStatusAction}>
                                <input name="taskId" type="hidden" value={event.id} />
                                <input name="currentStatus" type="hidden" value={event.status} />
                                <Button className="px-2 py-1 text-[10px]" type="submit" variant="secondary">
                                  {event.isCompleted ? <RotateCcw className="size-3" /> : <Check className="size-3" />}
                                </Button>
                              </form>
                              <Link
                                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-slate-800"
                                href={event.editHref ?? "/tasks"}
                              >
                                <Pencil className="size-3" />
                              </Link>
                              <form action={deleteTaskAction}>
                                <input name="taskId" type="hidden" value={event.id} />
                                <Button className="px-2 py-1 text-[10px]" type="submit" variant="ghost">
                                  <Trash2 className="size-3" />
                                </Button>
                              </form>
                            </div>
                          ) : null}
                          {event.type === "shift" ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              <Link
                                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-slate-800"
                                href={event.editHref ?? "/shifts"}
                              >
                                <Pencil className="size-3" />
                              </Link>
                              <form action={deleteShiftAction}>
                                <input name="shiftId" type="hidden" value={event.id} />
                                <Button className="px-2 py-1 text-[10px]" type="submit" variant="ghost">
                                  <Trash2 className="size-3" />
                                </Button>
                              </form>
                            </div>
                          ) : null}
                        </div>
                      ))}
                      {dayEvents.length > 4 ? (
                        <p className="text-[11px] font-semibold text-slate-500">
                          +{dayEvents.length - 4} 件の予定
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <div className="space-y-6 md:sticky md:top-28">
            <Panel className="h-fit space-y-4 border-slate-200 bg-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Salary</p>
                <h3 className="text-lg font-semibold text-slate-900">今月の給料見込み</h3>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {monthFormatter.format(currentMonth)}
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-900">{currencyFormatter.format(monthlyPay)}</p>
                <p className="mt-2 text-sm text-emerald-800">
                  {monthlyShifts.length}件 / {monthlyHours.toFixed(1)}時間
                </p>
              </div>
            </Panel>

            <Panel className="h-fit space-y-4 border-slate-200 bg-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Upcoming
                </p>
                <h3 className="text-lg font-semibold text-slate-900">1週間以内の未完了</h3>
              </div>

              {upcomingItems.length === 0 ? (
                <p className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-600">
                  期限が1週間以内の未完了課題・タスクはありません。
                </p>
              ) : (
                <div className="space-y-2">
                  {upcomingItems.map((item) => (
                    <div
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3"
                      key={item.id}
                    >
                      <p className="text-xs font-semibold text-rose-700">{item.due_date}</p>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}
