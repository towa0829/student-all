import { redirect } from "next/navigation";

import { CalendarPage } from "@/features/calendar/calendar-page";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Database } from "@/types/supabase";

type AssignmentRecord = Database["public"]["Tables"]["assignments"]["Row"];
type TaskRecord = Database["public"]["Tables"]["tasks"]["Row"];
type CalendarShiftRecord = Database["public"]["Tables"]["shifts"]["Row"] & {
  job_type_name?: string | null;
};

type ScheduleRecord = Database["public"]["Tables"]["schedules"]["Row"];

type CalendarRouteProps = {
  searchParams: Promise<{
    addDate?: string;
    addType?: "assignment" | "schedule" | "shift" | "task";
    editId?: string;
    editType?: "assignment" | "schedule" | "shift" | "task";
    month?: string;
  }>;
};

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseMonthParam(month?: string) {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;

  if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return new Date(year, monthIndex, 1);
}

export default async function CalendarRoute({ searchParams }: CalendarRouteProps) {
  const { addDate, addType, editId, editType, month } = await searchParams;
  const today = new Date();
  const weekLater = new Date(today);

  weekLater.setDate(today.getDate() + 7);

  const todayKey = formatDateKey(today);
  const weekLaterKey = formatDateKey(weekLater);
  const currentMonth = parseMonthParam(month);
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const rangeStart = new Date(monthStart);
  const rangeEnd = new Date(monthEnd);

  rangeStart.setDate(monthStart.getDate() - monthStart.getDay());
  rangeEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));

  const rangeStartKey = formatDateKey(rangeStart);
  const rangeEndKey = formatDateKey(rangeEnd);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/calendar");
  }

  const [
    assignmentsResult,
    shiftsResult,
    tasksResult,
    jobTypesResult,
    schedulesResult,
    upcomingAssignmentsResult,
    upcomingTasksResult
  ] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, user_id, class_id, title, due_date, status, memo, created_at")
      .eq("user_id", user.id)
      .gte("due_date", rangeStartKey)
      .lte("due_date", rangeEndKey)
      .order("due_date", { ascending: true }),
    supabase
      .from("shifts")
      .select("id, user_id, job_type_id, date, start_time, end_time, hourly_wage, created_at")
      .eq("user_id", user.id)
      .gte("date", rangeStartKey)
      .lte("date", rangeEndKey)
      .order("date", { ascending: true }),
    supabase
      .from("tasks")
      .select("id, user_id, title, due_date, status, created_at")
      .eq("user_id", user.id)
      .not("due_date", "is", null)
      .gte("due_date", rangeStartKey)
      .lte("due_date", rangeEndKey)
      .order("due_date", { ascending: true }),
    supabase
      .from("job_types")
      .select("id, name, hourly_wage")
      .eq("user_id", user.id),
    supabase
      .from("schedules")
      .select("id, user_id, title, start_at, end_at, memo, created_at")
      .eq("user_id", user.id)
      .gte("start_at", rangeStartKey)
      .lte("start_at", rangeEndKey + "T23:59")
      .order("start_at", { ascending: true }),
    supabase
      .from("assignments")
      .select("id, title, due_date, status")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .gte("due_date", todayKey)
      .lte("due_date", weekLaterKey)
      .order("due_date", { ascending: true }),
    supabase
      .from("tasks")
      .select("id, title, due_date, status")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .not("due_date", "is", null)
      .gte("due_date", todayKey)
      .lte("due_date", weekLaterKey)
      .order("due_date", { ascending: true })
  ]);

  let shiftRows: CalendarShiftRecord[] = shiftsResult.error ? [] : ((shiftsResult.data ?? []) as CalendarShiftRecord[]);
  let resolvedShiftsError = shiftsResult.error;
  const jobTypeMap = new Map<string, string>();

  if (!jobTypesResult.error) {
    (jobTypesResult.data ?? []).forEach((jobType) => {
      jobTypeMap.set(jobType.id, jobType.name);
    });
  }

  if (shiftsResult.error?.code === "42703" && shiftsResult.error.message.includes("job_type_id")) {
    const legacyShiftsResult = await supabase
      .from("shifts")
      .select("id, user_id, date, start_time, end_time, hourly_wage, created_at")
      .eq("user_id", user.id)
      .gte("date", rangeStartKey)
      .lte("date", rangeEndKey)
      .order("date", { ascending: true });

    if (!legacyShiftsResult.error) {
      shiftRows = (legacyShiftsResult.data ?? []).map((shift) => ({
        ...shift,
        job_type_name: null,
        job_type_id: null
      }));
      resolvedShiftsError = null;
    }
  } else if (!resolvedShiftsError) {
    shiftRows = (shiftRows ?? []).map((shift) => ({
      ...shift,
      job_type_name: shift.job_type_id ? (jobTypeMap.get(shift.job_type_id) ?? null) : null
    }));
  }

  const schedules: ScheduleRecord[] = schedulesResult.error ? [] : (schedulesResult.data ?? []);
  const jobTypes = jobTypesResult.error ? [] : (jobTypesResult.data ?? []);

  const queryErrors = [
    { error: assignmentsResult.error, table: "assignments" },
    { error: resolvedShiftsError, table: "shifts" },
    { error: tasksResult.error, table: "tasks" },
    { error: jobTypesResult.error, table: "job_types" },
    { error: schedulesResult.error, table: "schedules" },
    { error: upcomingAssignmentsResult.error, table: "assignments_upcoming" },
    { error: upcomingTasksResult.error, table: "tasks_upcoming" }
  ].filter((item) => item.error);

  const assignments: AssignmentRecord[] = assignmentsResult.error ? [] : (assignmentsResult.data ?? []);
  const tasks: TaskRecord[] = tasksResult.error ? [] : (tasksResult.data ?? []);
  const shifts: CalendarShiftRecord[] = resolvedShiftsError ? [] : shiftRows;
  const upcomingAssignments = upcomingAssignmentsResult.error
    ? []
    : (upcomingAssignmentsResult.data ?? []);
  const upcomingTasks = upcomingTasksResult.error
    ? []
    : (upcomingTasksResult.data ?? []).flatMap((item) =>
        item.due_date ? [{ ...item, due_date: item.due_date }] : []
      );
  const normalizedShifts: CalendarShiftRecord[] = shifts.map((shift) => ({
    ...shift,
    job_type_name: "job_type_name" in shift ? (shift.job_type_name ?? null) : null
  }));

  const modalItem =
    editId && editType
      ? editType === "assignment"
        ? assignments.find((item) => item.id === editId)
        : editType === "task"
          ? tasks.find((item) => item.id === editId)
          : editType === "schedule"
            ? schedules.find((item) => item.id === editId)
            : normalizedShifts.find((item) => item.id === editId)
      : null;

  if (queryErrors.length > 0) {
    console.warn(
      "Calendar query failed:",
      queryErrors.map((item) => ({
        code: item.error?.code,
        message: item.error?.message,
        table: item.table
      }))
    );
  }

  return (
    <CalendarPage
      assignments={assignments}
      currentMonth={currentMonth}
      dataWarning={
        queryErrors.length > 0
          ? "一部データの取得に失敗したため、表示可能な情報のみを表示しています。"
          : null
      }
      addDate={addDate && /^\d{4}-\d{2}-\d{2}$/.test(addDate) ? addDate : null}
      addType={addType ?? null}
      editId={editId ?? null}
      editType={editType ?? null}
      jobTypes={jobTypes}
      modalItem={modalItem ?? null}
      monthParam={formatDateKey(currentMonth).slice(0, 7)}
      schedules={schedules}
      upcomingAssignments={upcomingAssignments}
      upcomingTasks={upcomingTasks}
      shifts={normalizedShifts}
      tasks={tasks}
      userEmail={user.email ?? null}
    />
  );
}
