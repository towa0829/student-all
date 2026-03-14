"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  type AssignmentFormState,
  initialAssignmentFormState
} from "@/features/assignments/types";

function getAssignmentPayload(formData: FormData) {
  const title = formData.get("title");
  const dueDate = formData.get("dueDate");
  const memo = formData.get("memo");
  const classId = formData.get("classId");

  if (typeof title !== "string" || typeof dueDate !== "string") {
    return null;
  }

  return {
    title: title.trim(),
    due_date: dueDate,
    memo: typeof memo === "string" && memo.trim() ? memo.trim() : null,
    class_id: typeof classId === "string" && classId ? classId : null
  };
}

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/assignments");
  }

  return {
    supabase,
    userId: user.id
  };
}

export async function createAssignmentAction(
  _: AssignmentFormState,
  formData: FormData
): Promise<AssignmentFormState> {
  const payload = getAssignmentPayload(formData);

  if (!payload?.title || !payload.due_date) {
    return {
      type: "error",
      message: "課題名と締切日は必須です。"
    };
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase.from("assignments").insert({
    ...payload,
    user_id: userId,
    status: "pending"
  });

  if (error) {
    return {
      type: "error",
      message: "課題を作成できませんでした。入力内容を確認してください。"
    };
  }

  revalidatePath("/assignments");
  redirect("/assignments");
}

export async function updateAssignmentAction(
  _: AssignmentFormState,
  formData: FormData
): Promise<AssignmentFormState> {
  const assignmentId = formData.get("assignmentId");
  const payload = getAssignmentPayload(formData);

  if (typeof assignmentId !== "string" || !assignmentId || !payload?.title || !payload.due_date) {
    return {
      type: "error",
      message: "更新に必要な情報が不足しています。"
    };
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase
    .from("assignments")
    .update(payload)
    .eq("id", assignmentId)
    .eq("user_id", userId);

  if (error) {
    return {
      type: "error",
      message: "課題を更新できませんでした。"
    };
  }

  revalidatePath("/assignments");
  redirect("/assignments");
}

export async function toggleAssignmentStatusAction(formData: FormData) {
  const assignmentId = formData.get("assignmentId");
  const currentStatus = formData.get("currentStatus");

  if (typeof assignmentId !== "string" || typeof currentStatus !== "string") {
    return;
  }

  const nextStatus = currentStatus === "completed" ? "pending" : "completed";
  const { supabase, userId } = await getAuthenticatedUserId();

  await supabase
    .from("assignments")
    .update({ status: nextStatus })
    .eq("id", assignmentId)
    .eq("user_id", userId);

  revalidatePath("/assignments");
}

export async function deleteAssignmentAction(formData: FormData) {
  const assignmentId = formData.get("assignmentId");

  if (typeof assignmentId !== "string") {
    return;
  }

  const { supabase, userId } = await getAuthenticatedUserId();

  await supabase.from("assignments").delete().eq("id", assignmentId).eq("user_id", userId);

  revalidatePath("/assignments");
}

export async function resetAssignmentFormAction() {
  return initialAssignmentFormState;
}
