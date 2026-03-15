"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  type ShiftFormState,
  initialShiftFormState
} from "@/features/shifts/types";

function getJobTypePayload(formData: FormData) {
  const name = formData.get("name");
  const hourlyWage = formData.get("hourlyWage");

  if (typeof name !== "string" || typeof hourlyWage !== "string") {
    return null;
  }

  const wageNumber = Number(hourlyWage);

  if (!name.trim() || Number.isNaN(wageNumber) || wageNumber < 0) {
    return null;
  }

  return {
    hourly_wage: Math.round(wageNumber),
    name: name.trim()
  };
}

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

function getShiftPayload(formData: FormData) {
  const date = formData.get("date");
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");
  const hourlyWage = formData.get("hourlyWage");
  const jobTypeId = formData.get("jobTypeId");

  if (
    typeof date !== "string" ||
    typeof startTime !== "string" ||
    typeof endTime !== "string" ||
    typeof hourlyWage !== "string" ||
    typeof jobTypeId !== "string"
  ) {
    return null;
  }

  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return null;
  }

  const hasJobType = Boolean(jobTypeId);
  const wageNumber = Number(hourlyWage);

  if (!hasJobType && (Number.isNaN(wageNumber) || wageNumber < 0)) {
    return null;
  }

  return {
    date,
    end_time: normalizeTime(endTime),
    hourly_wage: hasJobType ? null : Math.round(wageNumber),
    job_type_id: jobTypeId || null,
    start_time: normalizeTime(startTime)
  };
}

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/shifts");
  }

  return {
    supabase,
    userId: user.id
  };
}

async function resolveShiftPayload(formData: FormData) {
  const basePayload = getShiftPayload(formData);

  if (!basePayload) {
    return null;
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  let hourlyWage = basePayload.hourly_wage;

  if (basePayload.job_type_id) {
    const { data: jobType, error } = await supabase
      .from("job_types")
      .select("hourly_wage")
      .eq("id", basePayload.job_type_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !jobType) {
      return null;
    }

    hourlyWage = jobType.hourly_wage;
  }

  if (hourlyWage === null) {
    return null;
  }

  return {
    payload: {
      ...basePayload,
      hourly_wage: hourlyWage
    },
    supabase,
    userId
  };
}

export async function createShiftAction(
  _: ShiftFormState,
  formData: FormData
): Promise<ShiftFormState> {
  const result = await resolveShiftPayload(formData);

  if (!result) {
    return {
      type: "error",
      message: "入力値が不正です。時刻とバイト種類または時給を確認してください。"
    };
  }

  const { payload, supabase, userId } = result;
  const { error } = await supabase.from("shifts").insert({
    ...payload,
    user_id: userId
  });

  if (error) {
    return {
      type: "error",
      message: "シフトを作成できませんでした。"
    };
  }

  revalidatePath("/shifts");
  revalidatePath("/calendar");
  redirect("/shifts");
}

export async function updateShiftAction(
  _: ShiftFormState,
  formData: FormData
): Promise<ShiftFormState> {
  const shiftId = formData.get("shiftId");
  const result = await resolveShiftPayload(formData);

  if (typeof shiftId !== "string" || !shiftId || !result) {
    return {
      type: "error",
      message: "更新に必要な情報が不足しています。"
    };
  }

  const { payload, supabase, userId } = result;
  const { error } = await supabase
    .from("shifts")
    .update(payload)
    .eq("id", shiftId)
    .eq("user_id", userId);

  if (error) {
    return {
      type: "error",
      message: "シフトを更新できませんでした。"
    };
  }

  revalidatePath("/shifts");
  revalidatePath("/calendar");
  redirect("/shifts");
}

export async function deleteShiftAction(formData: FormData) {
  const shiftId = formData.get("shiftId");

  if (typeof shiftId !== "string") {
    return;
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  await supabase.from("shifts").delete().eq("id", shiftId).eq("user_id", userId);

  revalidatePath("/shifts");
  revalidatePath("/calendar");
}

export async function createJobTypeAction(formData: FormData) {
  const payload = getJobTypePayload(formData);

  if (!payload) {
    return;
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  await supabase.from("job_types").insert({
    ...payload,
    user_id: userId
  });

  revalidatePath("/shifts");
}

export async function deleteJobTypeAction(formData: FormData) {
  const jobTypeId = formData.get("jobTypeId");

  if (typeof jobTypeId !== "string") {
    return;
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  await supabase.from("job_types").delete().eq("id", jobTypeId).eq("user_id", userId);

  revalidatePath("/shifts");
}

export async function resetShiftFormAction() {
  return initialShiftFormState;
}
