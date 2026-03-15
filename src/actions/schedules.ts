"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  type ScheduleFormState,
} from "@/features/schedules/types";

function getSchedulePayload(formData: FormData) {
  const title = formData.get("title");
  const startAt = formData.get("startAt");
  const endAt = formData.get("endAt");
  const memo = formData.get("memo");

  if (
    typeof title !== "string" ||
    typeof startAt !== "string" ||
    typeof endAt !== "string"
  ) {
    return null;
  }

  return {
    title: title.trim(),
    start_at: startAt,
    end_at: endAt,
    memo: typeof memo === "string" && memo.trim() ? memo.trim() : null
  };
}

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/schedules");
  }

  return { supabase, userId: user.id };
}

function revalidateScheduleScreens() {
  revalidatePath("/schedules");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function createScheduleAction(
  _: ScheduleFormState,
  formData: FormData
): Promise<ScheduleFormState> {
  const payload = getSchedulePayload(formData);

  if (!payload?.title) {
    return { type: "error", message: "タイトルは必須です。" };
  }

  if (payload.start_at >= payload.end_at) {
    return { type: "error", message: "終了日時は開始日時より後にしてください。" };
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase.from("schedules").insert({
    ...payload,
    user_id: userId
  });

  if (error) {
    return { type: "error", message: "スケジュールを作成できませんでした。" };
  }

  revalidateScheduleScreens();
  redirect("/schedules");
}

export async function updateScheduleAction(
  _: ScheduleFormState,
  formData: FormData
): Promise<ScheduleFormState> {
  const scheduleId = formData.get("scheduleId");
  const payload = getSchedulePayload(formData);

  if (typeof scheduleId !== "string" || !scheduleId || !payload?.title) {
    return { type: "error", message: "更新に必要な情報が不足しています。" };
  }

  if (payload.start_at >= payload.end_at) {
    return { type: "error", message: "終了日時は開始日時より後にしてください。" };
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase
    .from("schedules")
    .update(payload)
    .eq("id", scheduleId)
    .eq("user_id", userId);

  if (error) {
    return { type: "error", message: "スケジュールを更新できませんでした。" };
  }

  revalidateScheduleScreens();
  redirect("/schedules");
}

export async function deleteScheduleAction(formData: FormData) {
  const scheduleId = formData.get("scheduleId");

  if (typeof scheduleId !== "string" || !scheduleId) {
    return;
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  await supabase.from("schedules").delete().eq("id", scheduleId).eq("user_id", userId);

  revalidateScheduleScreens();
}
