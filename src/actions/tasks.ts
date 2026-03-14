"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  type TaskFormState,
  initialTaskFormState
} from "@/features/tasks/types";

function getTaskPayload(formData: FormData) {
  const title = formData.get("title");
  const dueDate = formData.get("dueDate");

  if (typeof title !== "string" || typeof dueDate !== "string") {
    return null;
  }

  return {
    due_date: dueDate ? dueDate : null,
    title: title.trim()
  };
}

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/tasks");
  }

  return {
    supabase,
    userId: user.id
  };
}

export async function createTaskAction(
  _: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const payload = getTaskPayload(formData);

  if (!payload?.title) {
    return {
      type: "error",
      message: "タスク名は必須です。"
    };
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase.from("tasks").insert({
    ...payload,
    status: "pending",
    user_id: userId
  });

  if (error) {
    return {
      type: "error",
      message: "タスクを作成できませんでした。"
    };
  }

  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  redirect("/tasks");
}

export async function updateTaskAction(
  _: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const taskId = formData.get("taskId");
  const payload = getTaskPayload(formData);

  if (typeof taskId !== "string" || !taskId || !payload?.title) {
    return {
      type: "error",
      message: "更新に必要な情報が不足しています。"
    };
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) {
    return {
      type: "error",
      message: "タスクを更新できませんでした。"
    };
  }

  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  redirect("/tasks");
}

export async function toggleTaskStatusAction(formData: FormData) {
  const taskId = formData.get("taskId");
  const currentStatus = formData.get("currentStatus");

  if (typeof taskId !== "string" || typeof currentStatus !== "string") {
    return;
  }

  const nextStatus = currentStatus === "completed" ? "pending" : "completed";
  const { supabase, userId } = await getAuthenticatedUserId();

  await supabase
    .from("tasks")
    .update({ status: nextStatus })
    .eq("id", taskId)
    .eq("user_id", userId);

  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(formData: FormData) {
  const taskId = formData.get("taskId");

  if (typeof taskId !== "string") {
    return;
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId);

  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function resetTaskFormAction() {
  return initialTaskFormState;
}
