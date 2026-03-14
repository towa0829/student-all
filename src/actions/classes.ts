"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  type ClassFormState,
  initialClassFormState
} from "@/features/classes/types";

function getClassPayload(formData: FormData) {
  const name = formData.get("name");
  const dayOfWeek = formData.get("dayOfWeek");
  const period = formData.get("period");
  const room = formData.get("room");

  if (
    typeof name !== "string" ||
    typeof dayOfWeek !== "string" ||
    typeof period !== "string" ||
    typeof room !== "string"
  ) {
    return null;
  }

  const dayNumber = Number(dayOfWeek);
  const periodNumber = Number(period);

  if (
    Number.isNaN(dayNumber) ||
    Number.isNaN(periodNumber) ||
    dayNumber < 0 ||
    dayNumber > 6 ||
    periodNumber < 1 ||
    periodNumber > 8
  ) {
    return null;
  }

  return {
    day_of_week: dayNumber,
    name: name.trim(),
    period: periodNumber,
    room: room.trim()
  };
}

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/classes");
  }

  return {
    supabase,
    userId: user.id
  };
}

export async function createClassAction(
  _: ClassFormState,
  formData: FormData
): Promise<ClassFormState> {
  const payload = getClassPayload(formData);

  if (!payload?.name || !payload.room) {
    return {
      type: "error",
      message: "入力値が不正です。必須項目を確認してください。"
    };
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase.from("classes").insert({
    ...payload,
    user_id: userId
  });

  if (error) {
    return {
      type: "error",
      message: "授業を作成できませんでした。"
    };
  }

  revalidatePath("/classes");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  redirect("/classes");
}

export async function updateClassAction(
  _: ClassFormState,
  formData: FormData
): Promise<ClassFormState> {
  const classId = formData.get("classId");
  const payload = getClassPayload(formData);

  if (typeof classId !== "string" || !classId || !payload?.name || !payload.room) {
    return {
      type: "error",
      message: "更新に必要な情報が不足しています。"
    };
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase
    .from("classes")
    .update(payload)
    .eq("id", classId)
    .eq("user_id", userId);

  if (error) {
    return {
      type: "error",
      message: "授業を更新できませんでした。"
    };
  }

  revalidatePath("/classes");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  redirect("/classes");
}

export async function deleteClassAction(formData: FormData) {
  const classId = formData.get("classId");

  if (typeof classId !== "string") {
    return;
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  await supabase.from("classes").delete().eq("id", classId).eq("user_id", userId);

  revalidatePath("/classes");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function resetClassFormAction() {
  return initialClassFormState;
}
