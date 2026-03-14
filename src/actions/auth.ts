"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  type AuthActionState,
  initialAuthActionState
} from "@/features/auth/types";

function getCredentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return null;
  }

  return {
    email: email.trim(),
    password: password.trim()
  };
}

function getRedirectPath(formData: FormData) {
  const next = formData.get("next");

  if (typeof next !== "string" || !next.startsWith("/")) {
    return "/assignments";
  }

  return next;
}

export async function signInAction(
  _: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const credentials = getCredentials(formData);
  const redirectPath = getRedirectPath(formData);

  if (!credentials?.email || !credentials.password) {
    return {
      type: "error",
      message: "メールアドレスとパスワードを入力してください。"
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return {
      type: "error",
      message: "ログインに失敗しました。入力内容を確認してください。"
    };
  }

  revalidatePath("/", "layout");
  redirect(redirectPath);
}

export async function signUpAction(
  _: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const credentials = getCredentials(formData);
  const redirectPath = getRedirectPath(formData);

  if (!credentials?.email || !credentials.password) {
    return {
      type: "error",
      message: "メールアドレスとパスワードを入力してください。"
    };
  }

  if (credentials.password.length < 8) {
    return {
      type: "error",
      message: "パスワードは8文字以上で入力してください。"
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp(credentials);

  if (error) {
    return {
      type: "error",
      message: "サインアップに失敗しました。別のメールアドレスも試してください。"
    };
  }

  revalidatePath("/", "layout");

  if (data.session) {
    redirect(redirectPath);
  }

  return {
    ...initialAuthActionState,
    type: "success",
    message: "確認メールを送信しました。メールの案内に従って認証を完了してください。"
  };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}
