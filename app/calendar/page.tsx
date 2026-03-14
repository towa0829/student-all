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

  const [assignmentsResult, classesResult, shiftsResult, tasksResult] = await Promise.all([
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
      .select("id, user_id, date, start_time, end_time, hourly_wage, created_at")
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
      .order("due_date", { ascending: true })
  ]);

  if (assignmentsResult.error || classesResult.error || shiftsResult.error || tasksResult.error) {
    throw new Error("Failed to load calendar data.");
  }

  return (
    <CalendarPage
      assignments={assignmentsResult.data ?? []}
      classes={classesResult.data ?? []}
      currentMonth={currentMonth}
      shifts={shiftsResult.data ?? []}
      tasks={tasksResult.data ?? []}
      userEmail={user.email ?? null}
    />
  );
}
