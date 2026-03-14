import Link from "next/link";
import { BookOpenCheck, CalendarClock, CheckCircle2, LogOut, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";

import {
  createAssignmentAction,
  deleteAssignmentAction,
  toggleAssignmentStatusAction,
  updateAssignmentAction
} from "@/actions/assignments";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { AssignmentForm } from "@/features/assignments/assignment-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { AssignmentRecord, ClassRecord } from "@/features/assignments/types";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  month: "short",
  day: "numeric",
  weekday: "short"
});

type AssignmentsPageProps = {
  searchParams: Promise<{
    edit?: string;
  }>;
};

function getClassLabel(classes: ClassRecord[], classId: string | null) {
  if (!classId) {
    return "授業未設定";
  }

  return classes.find((schoolClass) => schoolClass.id === classId)?.name ?? "授業未設定";
}

function getSummary(assignments: AssignmentRecord[]) {
  const total = assignments.length;
  const completed = assignments.filter((assignment) => assignment.status === "completed").length;
  const pending = total - completed;
  const today = new Date().toISOString().slice(0, 10);
  const dueToday = assignments.filter((assignment) => assignment.due_date === today).length;

  return { completed, dueToday, pending, total };
}

export default async function AssignmentsPage({ searchParams }: AssignmentsPageProps) {
  const { edit } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: assignments, error: assignmentsError }, { data: classes, error: classesError }] =
    await Promise.all([
      supabase
        .from("assignments")
        .select("id, user_id, class_id, title, due_date, status, memo, created_at")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true }),
      supabase
        .from("classes")
        .select("id, user_id, name, day_of_week, period, room, created_at")
        .eq("user_id", user.id)
        .order("day_of_week", { ascending: true })
        .order("period", { ascending: true })
    ]);

  if (assignmentsError || classesError) {
    throw new Error("Failed to load assignments.");
  }

  const assignmentList = assignments ?? [];
  const classList = classes ?? [];
  const editingAssignment = assignmentList.find((assignment) => assignment.id === edit);
  const summary = getSummary(assignmentList);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-120 bg-[radial-gradient(circle_at_top_left,rgba(29,153,102,0.18),transparent_28%),linear-gradient(180deg,#f4fbf8_0%,#f8fafc_46%,#eef2ff_100%)]" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <header className="flex flex-col gap-5 rounded-4xl border border-white/70 bg-white/80 px-8 py-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
              <BookOpenCheck className="size-4" />
              Assignment Manager
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">課題管理</h1>
              <p className="text-sm leading-7 text-slate-600 md:text-base">
                {user.email} としてログイン中です。課題の作成、編集、削除、完了切り替えをこの画面で管理できます。
              </p>
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-brand-700">
                <Link href="/calendar">カレンダーへ</Link>
                <Link href="/">ホームへ</Link>
              </div>
            </div>
          </div>
          <form action={signOutAction}>
            <Button className="w-full md:w-auto" type="submit" variant="secondary">
              <span className="inline-flex items-center gap-2">
                <LogOut className="size-4" />
                ログアウト
              </span>
            </Button>
          </form>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">総課題数</p>
            <p className="text-3xl font-bold text-slate-950">{summary.total}</p>
          </Panel>
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">未完了</p>
            <p className="text-3xl font-bold text-amber-600">{summary.pending}</p>
          </Panel>
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">完了済み</p>
            <p className="text-3xl font-bold text-brand-600">{summary.completed}</p>
          </Panel>
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">今日締切</p>
            <p className="text-3xl font-bold text-sky-600">{summary.dueToday}</p>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {assignmentList.length === 0 ? (
              <Panel className="space-y-4">
                <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <PlusCircle className="size-5" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-slate-950">最初の課題を追加しましょう</h2>
                  <p className="leading-8 text-slate-600">
                    右側のフォームから課題を登録すると、締切順でここに一覧表示されます。
                  </p>
                </div>
              </Panel>
            ) : (
              assignmentList.map((assignment) => (
                <Panel className="space-y-5" key={assignment.id}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            assignment.status === "completed"
                              ? "inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                              : "inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                          }
                        >
                          {assignment.status === "completed" ? "完了" : "未完了"}
                        </span>
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {getClassLabel(classList, assignment.class_id)}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-950">{assignment.title}</h2>
                        <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
                          <CalendarClock className="size-4" />
                          締切 {dateFormatter.format(new Date(assignment.due_date))}
                        </p>
                      </div>
                      {assignment.memo ? (
                        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600">
                          {assignment.memo}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 md:max-w-56 md:justify-end">
                      <form action={toggleAssignmentStatusAction}>
                        <input name="assignmentId" type="hidden" value={assignment.id} />
                        <input name="currentStatus" type="hidden" value={assignment.status} />
                        <Button type="submit" variant="secondary">
                          <span className="inline-flex items-center gap-2">
                            <CheckCircle2 className="size-4" />
                            {assignment.status === "completed" ? "未完了に戻す" : "完了にする"}
                          </span>
                        </Button>
                      </form>
                      <Link href={`/assignments?edit=${assignment.id}`}>
                        <span className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                          編集
                        </span>
                      </Link>
                      <form action={deleteAssignmentAction}>
                        <input name="assignmentId" type="hidden" value={assignment.id} />
                        <Button className="bg-rose-600 text-white shadow-none hover:bg-rose-700" type="submit">
                          削除
                        </Button>
                      </form>
                    </div>
                  </div>
                </Panel>
              ))
            )}
          </div>

          <div className="space-y-4">
            <AssignmentForm
              action={editingAssignment ? updateAssignmentAction : createAssignmentAction}
              classes={classList}
              description={
                editingAssignment
                  ? "内容を更新すると一覧へ反映されます。完了状態は左側のボタンから切り替えます。"
                  : "課題名、締切日、授業、メモを登録できます。授業は未設定のままでも保存できます。"
              }
              initialAssignment={editingAssignment}
              pendingLabel={editingAssignment ? "更新中..." : "作成中..."}
              submitLabel={editingAssignment ? "課題を更新" : "課題を作成"}
              title={editingAssignment ? "課題を編集" : "新規課題を作成"}
            />

            <Panel className="space-y-4 bg-slate-950 text-slate-50">
              <h2 className="text-xl font-semibold">運用メモ</h2>
              <ul className="space-y-3 text-sm leading-7 text-slate-300">
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  課題は締切日の昇順で表示されます。
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  すべての操作は Server Actions 経由で実行されます。
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  データは user_id と RLS によりログインユーザー単位で分離されます。
                </li>
              </ul>
              {editingAssignment ? (
                <Link className="inline-flex text-sm font-semibold text-brand-200" href="/assignments">
                  編集をキャンセル
                </Link>
              ) : (
                <div className="flex flex-wrap gap-3 text-sm font-semibold text-brand-200">
                  <Link href="/calendar">カレンダーへ</Link>
                  <Link href="/">ホームに戻る</Link>
                </div>
              )}
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}
