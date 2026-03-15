"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

function normalizeTime(value: string) {
  return value.length === 5 ? `${value}:00` : value;
}

function parseTimeToMinutes(value: string) {
  const [hoursText, minutesText] = value.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

async function getAuthenticated() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/calendar");
  }

  return { supabase, userId: user.id };
}

function revalidateCalendarScreens() {
  revalidatePath("/calendar");
  revalidatePath("/assignments");
  revalidatePath("/tasks");
  revalidatePath("/shifts");
  revalidatePath("/dashboard");
}

function getCalendarRedirectPath(formData: FormData) {
  const month = formData.get("month");

  if (typeof month === "string" && /^\d{4}-\d{2}$/.test(month)) {
    return `/calendar?month=${month}`;
  }

  return "/calendar";
}

export async function updateAssignmentFromCalendarAction(formData: FormData) {
  const assignmentId = formData.get("assignmentId");
  const title = formData.get("title");
  const dueDate = formData.get("dueDate");
  const status = formData.get("status");

  if (
    typeof assignmentId !== "string" ||
    typeof title !== "string" ||
    typeof dueDate !== "string" ||
    typeof status !== "string" ||
    !assignmentId ||
    !title.trim() ||
    !dueDate ||
    (status !== "pending" && status !== "completed")
  ) {
    return;
  }

  const { supabase, userId } = await getAuthenticated();

  await supabase
    .from("assignments")
    .update({
      due_date: dueDate,
      status,
      title: title.trim()
    })
    .eq("id", assignmentId)
    .eq("user_id", userId);

  revalidateCalendarScreens();
  redirect(getCalendarRedirectPath(formData));
}

export async function updateTaskFromCalendarAction(formData: FormData) {
  const taskId = formData.get("taskId");
  const title = formData.get("title");
  const dueDate = formData.get("dueDate");
  const status = formData.get("status");

  if (
    typeof taskId !== "string" ||
    typeof title !== "string" ||
    typeof dueDate !== "string" ||
    typeof status !== "string" ||
    !taskId ||
    !title.trim() ||
    (status !== "pending" && status !== "completed")
  ) {
    return;
  }

  const { supabase, userId } = await getAuthenticated();

  await supabase
    .from("tasks")
    .update({
      due_date: dueDate || null,
      status,
      title: title.trim()
    })
    .eq("id", taskId)
    .eq("user_id", userId);

  revalidateCalendarScreens();
  redirect(getCalendarRedirectPath(formData));
}

export async function updateShiftFromCalendarAction(formData: FormData) {
  const shiftId = formData.get("shiftId");
  const date = formData.get("date");
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");
  const hourlyWage = formData.get("hourlyWage");

  if (
    typeof shiftId !== "string" ||
    typeof date !== "string" ||
    typeof startTime !== "string" ||
    typeof endTime !== "string" ||
    typeof hourlyWage !== "string" ||
    !shiftId ||
    !date
  ) {
    return;
  }

  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  const wage = Number(hourlyWage);

  if (
    startMinutes === null ||
    endMinutes === null ||
    endMinutes <= startMinutes ||
    Number.isNaN(wage) ||
    wage < 0
  ) {
    return;
  }

  const { supabase, userId } = await getAuthenticated();

  await supabase
    .from("shifts")
    .update({
      date,
      end_time: normalizeTime(endTime),
      hourly_wage: Math.round(wage),
      start_time: normalizeTime(startTime)
    })
    .eq("id", shiftId)
    .eq("user_id", userId);

  revalidateCalendarScreens();
  redirect(getCalendarRedirectPath(formData));
}

export async function updateScheduleFromCalendarAction(formData: FormData) {
  const scheduleId = formData.get("scheduleId");
  const title = formData.get("title");
  const startAt = formData.get("startAt");
  const endAt = formData.get("endAt");

  if (
    typeof scheduleId !== "string" ||
    typeof title !== "string" ||
    typeof startAt !== "string" ||
    typeof endAt !== "string" ||
    !scheduleId ||
    !title.trim() ||
    !startAt ||
    !endAt
  ) {
    return;
  }

  if (startAt >= endAt) {
    return;
  }

  const { supabase, userId } = await getAuthenticated();

  await supabase
    .from("schedules")
    .update({
      title: title.trim(),
      start_at: startAt,
      end_at: endAt
    })
    .eq("id", scheduleId)
    .eq("user_id", userId);

  revalidateCalendarScreens();
  redirect(getCalendarRedirectPath(formData));
}

export async function createAssignmentFromCalendarAction(formData: FormData) {
  const title = formData.get("title");
  const dueDate = formData.get("dueDate");

  if (
    typeof title !== "string" ||
    typeof dueDate !== "string" ||
    !title.trim() ||
    !dueDate
  ) {
    return;
  }

  const { supabase, userId } = await getAuthenticated();

  await supabase.from("assignments").insert({
    due_date: dueDate,
    status: "pending",
    title: title.trim(),
    user_id: userId
  });

  revalidateCalendarScreens();
  redirect(getCalendarRedirectPath(formData));
}

export async function createTaskFromCalendarAction(formData: FormData) {
  const title = formData.get("title");
  const dueDate = formData.get("dueDate");

  if (typeof title !== "string" || !title.trim()) {
    return;
  }

  const { supabase, userId } = await getAuthenticated();

  await supabase.from("tasks").insert({
    due_date: typeof dueDate === "string" && dueDate ? dueDate : null,
    status: "pending",
    title: title.trim(),
    user_id: userId
  });

  revalidateCalendarScreens();
  redirect(getCalendarRedirectPath(formData));
}

export async function createScheduleFromCalendarAction(formData: FormData) {
  const title = formData.get("title");
  const startAt = formData.get("startAt");
  const endAt = formData.get("endAt");

  if (
    typeof title !== "string" ||
    typeof startAt !== "string" ||
    typeof endAt !== "string" ||
    !title.trim() ||
    !startAt ||
    !endAt ||
    startAt >= endAt
  ) {
    return;
  }

  const { supabase, userId } = await getAuthenticated();

  await supabase.from("schedules").insert({
    end_at: endAt,
    start_at: startAt,
    title: title.trim(),
    user_id: userId
  });

  revalidateCalendarScreens();
  redirect(getCalendarRedirectPath(formData));
}

export async function createShiftFromCalendarAction(formData: FormData) {
  const date = formData.get("date");
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");
  const hourlyWageText = formData.get("hourlyWage");
  const jobTypeId = formData.get("jobTypeId");

  if (
    typeof date !== "string" ||
    typeof startTime !== "string" ||
    typeof endTime !== "string" ||
    typeof hourlyWageText !== "string" ||
    !date ||
    !startTime ||
    !endTime
  ) {
    return;
  }

  const normalizedStart = normalizeTime(startTime);
  const normalizedEnd = normalizeTime(endTime);
  const startMinutes = parseTimeToMinutes(normalizedStart);
  const endMinutes = parseTimeToMinutes(normalizedEnd);

  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
    return;
  }

  const hourlyWage = Number(hourlyWageText);

  if (Number.isNaN(hourlyWage) || hourlyWage < 0) {
    return;
  }

  const { supabase, userId } = await getAuthenticated();

  await supabase.from("shifts").insert({
    date,
    end_time: normalizedEnd,
    hourly_wage: hourlyWage,
    job_type_id: typeof jobTypeId === "string" && jobTypeId ? jobTypeId : null,
    start_time: normalizedStart,
    user_id: userId
  });

  revalidateCalendarScreens();
  redirect(getCalendarRedirectPath(formData));
}
