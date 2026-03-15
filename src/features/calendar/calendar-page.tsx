import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { deleteAssignmentAction } from "@/actions/assignments";
import { signOutAction } from "@/actions/auth";
import {
  updateAssignmentFromCalendarAction,
  updateScheduleFromCalendarAction,
  updateShiftFromCalendarAction,
  updateTaskFromCalendarAction,
  createAssignmentFromCalendarAction,
  createScheduleFromCalendarAction,
  createTaskFromCalendarAction
} from "@/actions/calendar";
import { deleteScheduleAction } from "@/actions/schedules";
import { deleteShiftAction } from "@/actions/shifts";
import { deleteTaskAction } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { FeatureHeader } from "@/components/layout/feature-header";
import { Panel } from "@/components/ui/panel";
import { CreateShiftForm } from "@/features/calendar/create-shift-form";
import type { Database } from "@/types/supabase";

type AssignmentRecord = Database["public"]["Tables"]["assignments"]["Row"];
type ShiftRecord = Database["public"]["Tables"]["shifts"]["Row"];
type TaskRecord = Database["public"]["Tables"]["tasks"]["Row"];
type ScheduleRecord = Database["public"]["Tables"]["schedules"]["Row"];
type CalendarShiftRecord = ShiftRecord & {
  job_type_name?: string | null;
};

type CalendarEvent = {
  id: string;
  type: "assignment" | "schedule" | "shift" | "task";
  title: string;
  timeLabel?: string;
  dateKey: string;
  isCompleted: boolean;
  sortTime: string;
  status?: "pending" | "completed";
};

type WeekScheduleBar = {
  endCol: number;
  id: string;
  lane: number;
  startCol: number;
  title: string;
};

type UpcomingItem = {
  id: string;
  title: string;
  due_date: string;
  status: string;
};

type CalendarPageProps = {
  addDate: string | null;
  addType: "assignment" | "schedule" | "shift" | "task" | null;
  assignments: AssignmentRecord[];
  currentMonth: Date;
  dataWarning?: string | null;
  editId: string | null;
  editType: "assignment" | "schedule" | "shift" | "task" | null;
  jobTypes: { id: string; name: string; hourly_wage: number }[];
  modalItem:
    | AssignmentRecord
    | TaskRecord
    | ScheduleRecord
    | CalendarShiftRecord
    | null;
  monthParam: string;
  schedules: ScheduleRecord[];
  shifts: CalendarShiftRecord[];
  tasks: TaskRecord[];
  upcomingAssignments: UpcomingItem[];
  upcomingTasks: UpcomingItem[];
  userEmail: string | null;
};

const dayLabels = ["日", "月", "火", "水", "木", "金", "土"] as const;

const baseEventStyle: Record<CalendarEvent["type"], string> = {
  assignment: "border-orange-300 bg-orange-100 text-orange-900",
  schedule: "border-teal-300 bg-teal-100 text-teal-900",
  shift: "border-sky-300 bg-sky-100 text-sky-900",
  task: "border-violet-300 bg-violet-100 text-violet-900"
};

function getEventStyle(event: CalendarEvent) {
  if ((event.type === "assignment" || event.type === "task") && event.isCompleted) {
    return "border-lime-300 bg-lime-100 text-lime-900";
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

function mergeEvents(
  assignments: AssignmentRecord[],
  schedules: ScheduleRecord[],
  shifts: CalendarShiftRecord[],
  tasks: TaskRecord[]
) {
  const events = new Map<string, CalendarEvent[]>();

  assignments.forEach((assignment) => {
    const current = events.get(assignment.due_date) ?? [];

    current.push({
      id: assignment.id,
      dateKey: assignment.due_date,
      type: "assignment",
      title: assignment.title,
      isCompleted: assignment.status === "completed",
      sortTime: "99:99",
      status: assignment.status
    });

    events.set(assignment.due_date, current);
  });

  shifts.forEach((shift) => {
    const current = events.get(shift.date) ?? [];

    current.push({
      id: shift.id,
      dateKey: shift.date,
      type: "shift",
      title: shift.job_type_name ?? "バイト",
      timeLabel: `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`,
      isCompleted: false,
      sortTime: shift.start_time.slice(0, 5)
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
      type: "task",
      title: task.title,
      isCompleted: task.status === "completed",
      sortTime: "99:99",
      status: task.status
    });

    events.set(task.due_date, current);
  });

  schedules.forEach((schedule) => {
    const startDateKey = schedule.start_at.slice(0, 10);
    const endDateKey = schedule.end_at.slice(0, 10);
    if (startDateKey === endDateKey) {
      const current = events.get(startDateKey) ?? [];

      current.push({
        id: schedule.id,
        dateKey: startDateKey,
        type: "schedule",
        title: schedule.title,
        timeLabel: `${schedule.start_at.slice(11, 16)} - ${schedule.end_at.slice(11, 16)}`,
        isCompleted: false,
        sortTime: schedule.start_at.slice(11, 16)
      });

      events.set(startDateKey, current);
    }
  });

  return events;
}

function createMonthLink(currentMonth: Date, offset: number) {
  const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
  const month = String(next.getMonth() + 1).padStart(2, "0");

  return `/calendar?month=${next.getFullYear()}-${month}`;
}

function diffDays(startKey: string, endKey: string) {
  const start = new Date(`${startKey}T00:00:00`).getTime();
  const end = new Date(`${endKey}T00:00:00`).getTime();

  return Math.floor((end - start) / 86400000);
}

function getWeekScheduleBars(weekDays: Date[], schedules: ScheduleRecord[]) {
  if (weekDays.length !== 7) {
    return [] as WeekScheduleBar[];
  }

  const weekStartKey = formatDateKey(weekDays[0]);
  const weekEndKey = formatDateKey(weekDays[6]);

  const targets = schedules
    .filter((schedule) => schedule.start_at.slice(0, 10) !== schedule.end_at.slice(0, 10))
    .filter((schedule) => {
      const startKey = schedule.start_at.slice(0, 10);
      const endKey = schedule.end_at.slice(0, 10);

      return !(endKey < weekStartKey || startKey > weekEndKey);
    })
    .map((schedule) => {
      const startKey = schedule.start_at.slice(0, 10);
      const endKey = schedule.end_at.slice(0, 10);

      return {
        id: schedule.id,
        startCol: Math.max(0, diffDays(weekStartKey, startKey)),
        endCol: Math.min(6, diffDays(weekStartKey, endKey)),
        title: schedule.title
      };
    })
    .sort((a, b) => a.startCol - b.startCol || a.endCol - b.endCol);

  const laneEnds: number[] = [];

  return targets.map((target) => {
    let lane = laneEnds.findIndex((endCol) => target.startCol > endCol);

    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(target.endCol);
    } else {
      laneEnds[lane] = target.endCol;
    }

    return {
      ...target,
      lane
    };
  });
}

export function CalendarPage({
  addDate,
  addType,
  assignments,
  currentMonth,
  dataWarning,
  editId,
  editType,
  jobTypes,
  modalItem,
  monthParam,
  schedules,
  shifts,
  tasks,
  upcomingAssignments,
  upcomingTasks,
  userEmail
}: CalendarPageProps) {
  const todayKey = formatDateKey(new Date());
  const { days } = buildMonthGrid(currentMonth);
  const eventsByDate = mergeEvents(assignments, schedules, shifts, tasks);
  const weekDays = Array.from({ length: days.length / 7 }, (_, index) =>
    days.slice(index * 7, index * 7 + 7)
  );
  const upcomingItems = [...upcomingAssignments, ...upcomingTasks].sort((a, b) =>
    a.due_date.localeCompare(b.due_date)
  );
  const monthFormatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long"
  });
  const closeModalLink = `/calendar?month=${monthParam}`;
  const isAssignmentModal = editType === "assignment" && modalItem && "due_date" in modalItem && "memo" in modalItem && !("start_at" in modalItem);
  const isTaskModal = editType === "task" && modalItem && "due_date" in modalItem && !("memo" in modalItem);
  const isShiftModal = editType === "shift" && modalItem && "start_time" in modalItem;
  const isScheduleModal = editType === "schedule" && modalItem && "start_at" in modalItem;

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[linear-gradient(180deg,#eef2f7_0%,#f8fafc_55%)]" />
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

        <section className="grid gap-6 md:items-start md:grid-cols-[1fr_320px]">
          <Panel className="min-w-0 space-y-6 border-slate-200 bg-white">
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

            <div className="space-y-2 overflow-hidden rounded-2xl border border-slate-200">
              {weekDays.map((week, weekIndex) => {
                const scheduleBars = getWeekScheduleBars(week, schedules);
                const laneCount = scheduleBars.length > 0 ? Math.max(...scheduleBars.map((bar) => bar.lane)) + 1 : 0;
                const barAreaHeight = laneCount > 0 ? laneCount * 24 + 20 : 0;

                return (
                  <div className="relative border-b border-slate-200 last:border-b-0" key={`week-${weekIndex}`}>
                    {scheduleBars.length > 0 ? (
                      <div className="pointer-events-none absolute inset-x-0 top-12 z-10 px-1">
                        {scheduleBars.map((bar) => {
                          const left = `calc(${(bar.startCol / 7) * 100}% + 3px)`;
                          const width = `calc(${((bar.endCol - bar.startCol + 1) / 7) * 100}% - 6px)`;

                          return (
                            <Link
                              className="pointer-events-auto absolute h-5 overflow-hidden rounded-md border border-teal-300 bg-teal-100 px-2 text-[10px] font-semibold leading-5 text-teal-900 hover:brightness-95"
                              href={`/calendar?month=${monthParam}&editType=schedule&editId=${bar.id}`}
                              key={`${bar.id}-${bar.startCol}-${bar.endCol}`}
                              style={{ left, top: `${bar.lane * 24}px`, width }}
                            >
                              {bar.title}
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}

                    <div className="grid grid-cols-7">
                      {week.map((day) => {
                        const key = formatDateKey(day);
                        const dayEvents = eventsByDate.get(key) ?? [];
                        const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                        const isToday = key === todayKey;

                        return (
                          <div
                            className="min-h-44 border-r border-slate-200 p-2 last:border-r-0"
                            key={key}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <Link
                                className={isToday ? "flex size-6 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white hover:opacity-80 transition-opacity" : isCurrentMonth ? "flex size-6 items-center justify-center rounded-full text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors" : "flex size-6 items-center justify-center rounded-full text-sm font-semibold text-slate-400 hover:bg-slate-50 transition-colors"}
                                href={`/calendar?month=${monthParam}&addDate=${key}`}
                              >
                                {day.getDate()}
                              </Link>
                            </div>

                            <div className="space-y-2" style={{ marginTop: `${barAreaHeight}px` }}>
                              {[...dayEvents].sort((a, b) => a.sortTime.localeCompare(b.sortTime)).slice(0, 4).map((event) => (
                                <Link
                                  className={`block rounded-xl border px-2 py-2 text-[11px] leading-5 transition-colors hover:brightness-[0.98] ${getEventStyle(event)}`}
                                  href={`/calendar?month=${monthParam}&editType=${event.type}&editId=${event.id}`}
                                  key={`${event.id}-${event.dateKey}`}
                                >
                                  <p className="flex items-center gap-1 font-semibold">
                                    {event.isCompleted ? <Check className="size-3" /> : null}
                                    {event.title}
                                  </p>
                                  {event.timeLabel ? <p>{event.timeLabel}</p> : null}
                                </Link>
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
                  </div>
                );
              })}
            </div>
          </Panel>

          <div className="space-y-6 md:sticky md:top-28">
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

        {editId && modalItem ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <Panel className="max-h-[85vh] w-full max-w-xl overflow-auto border-slate-200 bg-white">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">予定を編集</h3>
                <Link className="text-sm font-semibold text-slate-500 hover:text-slate-700" href={closeModalLink}>
                  閉じる
                </Link>
              </div>

              {isAssignmentModal ? (
                <div className="space-y-4">
                  <form action={updateAssignmentFromCalendarAction} className="space-y-4" id="calendar-assignment-form">
                    <input name="assignmentId" type="hidden" value={modalItem.id} />
                    <input name="month" type="hidden" value={monthParam} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="modal-assignment-title">
                        課題名
                      </label>
                      <input
                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        defaultValue={modalItem.title}
                        id="modal-assignment-title"
                        name="title"
                        required
                        type="text"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="modal-assignment-date">
                          締切日
                        </label>
                        <input
                          className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                          defaultValue={modalItem.due_date}
                          id="modal-assignment-date"
                          name="dueDate"
                          required
                          type="date"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="modal-assignment-status">
                          状態
                        </label>
                        <select
                          className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                          defaultValue={modalItem.status}
                          id="modal-assignment-status"
                          name="status"
                        >
                          <option value="pending">未完了</option>
                          <option value="completed">完了</option>
                        </select>
                      </div>
                    </div>
                  </form>
                  <div className="flex items-center gap-2">
                    <Button form="calendar-assignment-form" type="submit">保存</Button>
                    <form action={deleteAssignmentAction}>
                      <input name="assignmentId" type="hidden" value={modalItem.id} />
                      <Button className="bg-rose-600 text-white shadow-none hover:bg-rose-700" type="submit">
                        削除
                      </Button>
                    </form>
                  </div>
                </div>
              ) : null}

              {isTaskModal ? (
                <div className="space-y-4">
                  <form action={updateTaskFromCalendarAction} className="space-y-4" id="calendar-task-form">
                    <input name="taskId" type="hidden" value={modalItem.id} />
                    <input name="month" type="hidden" value={monthParam} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="modal-task-title">
                        タスク名
                      </label>
                      <input
                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        defaultValue={modalItem.title}
                        id="modal-task-title"
                        name="title"
                        required
                        type="text"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="modal-task-date">
                          締切日
                        </label>
                        <input
                          className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                          defaultValue={modalItem.due_date ?? ""}
                          id="modal-task-date"
                          name="dueDate"
                          type="date"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="modal-task-status">
                          状態
                        </label>
                        <select
                          className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                          defaultValue={modalItem.status}
                          id="modal-task-status"
                          name="status"
                        >
                          <option value="pending">未完了</option>
                          <option value="completed">完了</option>
                        </select>
                      </div>
                    </div>
                  </form>
                  <div className="flex items-center gap-2">
                    <Button form="calendar-task-form" type="submit">保存</Button>
                    <form action={deleteTaskAction}>
                      <input name="taskId" type="hidden" value={modalItem.id} />
                      <Button className="bg-rose-600 text-white shadow-none hover:bg-rose-700" type="submit">
                        削除
                      </Button>
                    </form>
                  </div>
                </div>
              ) : null}

              {isShiftModal ? (                <div className="space-y-4">
                  <form action={updateShiftFromCalendarAction} className="space-y-4" id="calendar-shift-form">
                    <input name="shiftId" type="hidden" value={modalItem.id} />
                    <input name="month" type="hidden" value={monthParam} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="modal-shift-date">
                        勤務日
                      </label>
                      <input
                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        defaultValue={modalItem.date}
                        id="modal-shift-date"
                        name="date"
                        required
                        type="date"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="modal-shift-start">
                          開始時刻
                        </label>
                        <input
                          className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                          defaultValue={modalItem.start_time.slice(0, 5)}
                          id="modal-shift-start"
                          name="startTime"
                          required
                          type="time"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="modal-shift-end">
                          終了時刻
                        </label>
                        <input
                          className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                          defaultValue={modalItem.end_time.slice(0, 5)}
                          id="modal-shift-end"
                          name="endTime"
                          required
                          type="time"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="modal-shift-wage">
                        時給（円）
                      </label>
                      <input
                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        defaultValue={modalItem.hourly_wage}
                        id="modal-shift-wage"
                        min={0}
                        name="hourlyWage"
                        required
                        type="number"
                      />
                    </div>
                  </form>
                  <div className="flex items-center gap-2">
                    <Button form="calendar-shift-form" type="submit">保存</Button>
                    <form action={deleteShiftAction}>
                      <input name="shiftId" type="hidden" value={modalItem.id} />
                      <Button className="bg-rose-600 text-white shadow-none hover:bg-rose-700" type="submit">
                        削除
                      </Button>
                    </form>
                  </div>
                </div>
              ) : null}

              {isScheduleModal ? (
                <div className="space-y-4">
                  <form action={updateScheduleFromCalendarAction} className="space-y-4" id="calendar-schedule-form">
                    <input name="scheduleId" type="hidden" value={modalItem.id} />
                    <input name="month" type="hidden" value={monthParam} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="modal-schedule-title">
                        タイトル
                      </label>
                      <input
                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        defaultValue={modalItem.title}
                        id="modal-schedule-title"
                        name="title"
                        required
                        type="text"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="modal-schedule-start">
                          開始日時
                        </label>
                        <input
                          className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                          defaultValue={modalItem.start_at}
                          id="modal-schedule-start"
                          name="startAt"
                          required
                          type="datetime-local"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="modal-schedule-end">
                          終了日時
                        </label>
                        <input
                          className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                          defaultValue={modalItem.end_at}
                          id="modal-schedule-end"
                          name="endAt"
                          required
                          type="datetime-local"
                        />
                      </div>
                    </div>
                  </form>
                  <div className="flex items-center gap-2">
                    <Button form="calendar-schedule-form" type="submit">保存</Button>
                    <form action={deleteScheduleAction}>
                      <input name="scheduleId" type="hidden" value={modalItem.id} />
                      <Button className="bg-rose-600 text-white shadow-none hover:bg-rose-700" type="submit">
                        削除
                      </Button>
                    </form>
                  </div>
                </div>
              ) : null}
            </Panel>
          </div>
        ) : null}

        {addDate && !editId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
            <Panel className="max-h-[85vh] w-full max-w-xl overflow-auto border-slate-200 bg-white">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{addDate}</p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {addType ? (
                      <>
                        {addType === "schedule" && "スケジュールを追加"}
                        {addType === "shift" && "シフトを追加"}
                        {addType === "task" && "タスクを追加"}
                        {addType === "assignment" && "課題を追加"}
                      </>
                    ) : (
                      "何を追加しますか？"
                    )}
                  </h3>
                </div>
                <Link className="text-sm font-semibold text-slate-500 hover:text-slate-700" href={closeModalLink}>
                  閉じる
                </Link>
              </div>

              {!addType ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    className="flex items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 px-4 py-5 text-sm font-semibold text-teal-900 transition hover:bg-teal-100"
                    href={`/calendar?month=${monthParam}&addDate=${addDate}&addType=schedule`}
                  >
                    スケジュール
                  </Link>
                  <Link
                    className="flex items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 px-4 py-5 text-sm font-semibold text-sky-900 transition hover:bg-sky-100"
                    href={`/calendar?month=${monthParam}&addDate=${addDate}&addType=shift`}
                  >
                    シフト
                  </Link>
                  <Link
                    className="flex items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 px-4 py-5 text-sm font-semibold text-violet-900 transition hover:bg-violet-100"
                    href={`/calendar?month=${monthParam}&addDate=${addDate}&addType=task`}
                  >
                    タスク
                  </Link>
                  <Link
                    className="flex items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 px-4 py-5 text-sm font-semibold text-orange-900 transition hover:bg-orange-100"
                    href={`/calendar?month=${monthParam}&addDate=${addDate}&addType=assignment`}
                  >
                    課題
                  </Link>
                </div>
              ) : null}

              {addType === "schedule" ? (
                <div className="space-y-4">
                  <form action={createScheduleFromCalendarAction} className="space-y-4" id="create-schedule-form">
                    <input name="month" type="hidden" value={monthParam} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="new-schedule-title">タイトル</label>
                      <input
                        autoFocus
                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        id="new-schedule-title"
                        name="title"
                        required
                        type="text"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="new-schedule-start">開始日時</label>
                        <input
                          className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                          defaultValue={`${addDate}T09:00`}
                          id="new-schedule-start"
                          name="startAt"
                          required
                          type="datetime-local"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700" htmlFor="new-schedule-end">終了日時</label>
                        <input
                          className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                          defaultValue={`${addDate}T10:00`}
                          id="new-schedule-end"
                          name="endAt"
                          required
                          type="datetime-local"
                        />
                      </div>
                    </div>
                  </form>
                  <div className="flex items-center gap-2">
                    <Button form="create-schedule-form" type="submit">追加</Button>
                    <Link className="text-sm font-semibold text-slate-500 hover:text-slate-700" href={`/calendar?month=${monthParam}&addDate=${addDate}`}>戻る</Link>
                  </div>
                </div>
              ) : null}

              {addType === "shift" ? (
                <CreateShiftForm addDate={addDate} jobTypes={jobTypes} monthParam={monthParam} />
              ) : null}

              {addType === "task" ? (
                <div className="space-y-4">
                  <form action={createTaskFromCalendarAction} className="space-y-4" id="create-task-form">
                    <input name="month" type="hidden" value={monthParam} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="new-task-title">タスク名</label>
                      <input
                        autoFocus
                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        id="new-task-title"
                        name="title"
                        required
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="new-task-date">締切日</label>
                      <input
                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        defaultValue={addDate}
                        id="new-task-date"
                        name="dueDate"
                        type="date"
                      />
                    </div>
                  </form>
                  <div className="flex items-center gap-2">
                    <Button form="create-task-form" type="submit">追加</Button>
                    <Link className="text-sm font-semibold text-slate-500 hover:text-slate-700" href={`/calendar?month=${monthParam}&addDate=${addDate}`}>戻る</Link>
                  </div>
                </div>
              ) : null}

              {addType === "assignment" ? (
                <div className="space-y-4">
                  <form action={createAssignmentFromCalendarAction} className="space-y-4" id="create-assignment-form">
                    <input name="month" type="hidden" value={monthParam} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="new-assignment-title">課題名</label>
                      <input
                        autoFocus
                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        id="new-assignment-title"
                        name="title"
                        required
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="new-assignment-date">締切日</label>
                      <input
                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        defaultValue={addDate}
                        id="new-assignment-date"
                        name="dueDate"
                        required
                        type="date"
                      />
                    </div>
                  </form>
                  <div className="flex items-center gap-2">
                    <Button form="create-assignment-form" type="submit">追加</Button>
                    <Link className="text-sm font-semibold text-slate-500 hover:text-slate-700" href={`/calendar?month=${monthParam}&addDate=${addDate}`}>戻る</Link>
                  </div>
                </div>
              ) : null}
            </Panel>
          </div>
        ) : null}
      </div>
    </main>
  );
}
