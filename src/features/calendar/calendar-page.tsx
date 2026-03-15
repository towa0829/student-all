import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { deleteAssignmentAction } from "@/actions/assignments";
import { signOutAction } from "@/actions/auth";
import {
  updateAssignmentFromCalendarAction,
  updateShiftFromCalendarAction,
  updateTaskFromCalendarAction
} from "@/actions/calendar";
import { deleteShiftAction } from "@/actions/shifts";
import { deleteTaskAction } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { FeatureHeader } from "@/components/layout/feature-header";
import { Panel } from "@/components/ui/panel";
import type { Database } from "@/types/supabase";

type AssignmentRecord = Database["public"]["Tables"]["assignments"]["Row"];
type ShiftRecord = Database["public"]["Tables"]["shifts"]["Row"];
type TaskRecord = Database["public"]["Tables"]["tasks"]["Row"];
type CalendarShiftRecord = ShiftRecord & {
  job_type_name?: string | null;
};

type CalendarEvent = {
  id: string;
  type: "assignment" | "shift" | "task";
  title: string;
  timeLabel?: string;
  dateKey: string;
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
  currentMonth: Date;
  dataWarning?: string | null;
  editId: string | null;
  editType: "assignment" | "shift" | "task" | null;
  modalItem:
    | AssignmentRecord
    | TaskRecord
    | CalendarShiftRecord
    | null;
  monthParam: string;
  shifts: CalendarShiftRecord[];
  tasks: TaskRecord[];
  upcomingAssignments: UpcomingItem[];
  upcomingTasks: UpcomingItem[];
  userEmail: string | null;
};

const dayLabels = ["日", "月", "火", "水", "木", "金", "土"] as const;

const baseEventStyle: Record<CalendarEvent["type"], string> = {
  assignment: "border-orange-300 bg-orange-100 text-orange-900",
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
      type: "task",
      title: task.title,
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
  currentMonth,
  dataWarning,
  editId,
  editType,
  modalItem,
  monthParam,
  shifts,
  tasks,
  upcomingAssignments,
  upcomingTasks,
  userEmail
}: CalendarPageProps) {
  const { days } = buildMonthGrid(currentMonth);
  const eventsByDate = mergeEvents(assignments, shifts, tasks);
  const upcomingItems = [...upcomingAssignments, ...upcomingTasks].sort((a, b) =>
    a.due_date.localeCompare(b.due_date)
  );
  const monthFormatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long"
  });
  const closeModalLink = `/calendar?month=${monthParam}`;
  const isAssignmentModal = editType === "assignment" && modalItem && "due_date" in modalItem && "memo" in modalItem;
  const isTaskModal = editType === "task" && modalItem && "due_date" in modalItem && !("memo" in modalItem);
  const isShiftModal = editType === "shift" && modalItem && "start_time" in modalItem;

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
                        <Link
                          className={`block rounded-2xl border px-2 py-2 text-[11px] leading-5 transition-colors hover:brightness-[0.98] ${getEventStyle(event)}`}
                          href={`/calendar?month=${monthParam}&editType=${event.type}&editId=${event.id}`}
                          key={event.id}
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

              {isShiftModal ? (
                <div className="space-y-4">
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
            </Panel>
          </div>
        ) : null}
      </div>
    </main>
  );
}
