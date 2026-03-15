import Link from "next/link";
import { CalendarClock, CheckCircle2, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";

import {
  createAssignmentAction,
  deleteAssignmentAction,
  toggleAssignmentStatusAction,
  updateAssignmentAction
} from "@/actions/assignments";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { FeatureHeader } from "@/components/layout/feature-header";
import { Panel } from "@/components/ui/panel";
import { AssignmentForm } from "@/features/assignments/assignment-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { AssignmentRecord } from "@/features/assignments/types";

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

  const { data: assignments, error: assignmentsError } = await supabase
    .from("assignments")
    .select("id, user_id, class_id, title, due_date, status, memo, created_at")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true });

  const queryErrors = [{ error: assignmentsError, table: "assignments" }].filter((item) => item.error);

  if (queryErrors.length > 0) {
    console.warn(
      "Assignments query failed:",
      queryErrors.map((item) => ({
        code: item.error?.code,
        message: item.error?.message,
        table: item.table
      }))
    );
  }

  const assignmentList = assignmentsError ? [] : (assignments ?? []);
  const editingAssignment = assignmentList.find((assignment) => assignment.id === edit);
  const summary = getSummary(assignmentList);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-120 bg-[radial-gradient(circle_at_top_left,rgba(29,153,102,0.18),transparent_28%),linear-gradient(180deg,#f4fbf8_0%,#f8fafc_46%,#eef2ff_100%)]" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <FeatureHeader
          signOutAction={signOutAction}
          userLabel={user.email ?? "ユーザー"}
        />

        {queryErrors.length > 0 ? (
          <Panel className="border-amber-200 bg-amber-50">
            <p className="text-sm font-medium text-amber-800">
              一部データの取得に失敗したため、表示可能な情報のみを表示しています。
            </p>
          </Panel>
        ) : null}

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
              description={
                editingAssignment
                  ? "内容を更新すると一覧へ反映されます。完了状態は左側のボタンから切り替えます。"
                  : "課題名、締切日、メモを登録できます。"
              }
              initialAssignment={editingAssignment}
              pendingLabel={editingAssignment ? "更新中..." : "作成中..."}
              submitLabel={editingAssignment ? "課題を更新" : "課題を作成"}
              title={editingAssignment ? "課題を編集" : "新規課題を作成"}
            />

            {editingAssignment ? (
              <Link className="inline-flex text-sm font-semibold text-brand-700" href="/assignments">
                編集をキャンセル
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
