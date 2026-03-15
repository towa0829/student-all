import { redirect } from "next/navigation";

import { CalendarPage } from "@/features/calendar/calendar-page";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type CalendarRouteProps = {
  searchParams: Promise<{
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
  const { month } = await searchParams;
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
    classesResult,
    shiftsResult,
    tasksResult,
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
      .from("classes")
      .select("id, user_id, name, day_of_week, period, room, created_at")
      .eq("user_id", user.id)
      .order("day_of_week", { ascending: true })
      .order("period", { ascending: true }),
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

  const queryErrors = [
    { error: assignmentsResult.error, table: "assignments" },
    { error: classesResult.error, table: "classes" },
    { error: shiftsResult.error, table: "shifts" },
    { error: tasksResult.error, table: "tasks" },
    { error: upcomingAssignmentsResult.error, table: "assignments_upcoming" },
    { error: upcomingTasksResult.error, table: "tasks_upcoming" }
  ].filter((item) => item.error);

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
      assignments={assignmentsResult.error ? [] : (assignmentsResult.data ?? [])}
      classes={classesResult.error ? [] : (classesResult.data ?? [])}
      currentMonth={currentMonth}
      dataWarning={
        queryErrors.length > 0
          ? "一部データの取得に失敗したため、表示可能な情報のみを表示しています。"
          : null
      }
      upcomingAssignments={
        upcomingAssignmentsResult.error ? [] : (upcomingAssignmentsResult.data ?? [])
      }
      upcomingTasks={upcomingTasksResult.error ? [] : (upcomingTasksResult.data ?? [])}
      shifts={shiftsResult.error ? [] : (shiftsResult.data ?? [])}
      tasks={tasksResult.error ? [] : (tasksResult.data ?? [])}
      userEmail={user.email ?? null}
    />
  );
}
