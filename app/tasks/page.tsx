import Link from "next/link";
import { CheckSquare, LogOut, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";

import { signOutAction } from "@/actions/auth";
import {
  createTaskAction,
  deleteTaskAction,
  toggleTaskStatusAction,
  updateTaskAction
} from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { TaskForm } from "@/features/tasks/task-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  month: "short",
  day: "numeric",
  weekday: "short"
});

type TasksPageProps = {
  searchParams: Promise<{
    edit?: string;
  }>;
};

function getSummary(tasks: Array<{ status: "pending" | "completed"; due_date: string | null }>) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const pending = total - completed;
  const today = new Date().toISOString().slice(0, 10);
  const dueToday = tasks.filter((task) => task.due_date === today).length;

  return { completed, dueToday, pending, total };
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const { edit } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/tasks");
  }

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, user_id, title, due_date, status, created_at")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to load tasks.");
  }

  const taskList = tasks ?? [];
  const editingTask = taskList.find((task) => task.id === edit);
  const summary = getSummary(taskList);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-120 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_30%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(180deg,#f5f3ff_0%,#f8fafc_56%,#eef2ff_100%)]" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <header className="flex flex-col gap-5 rounded-4xl border border-white/70 bg-white/80 px-8 py-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-violet-700">
              <CheckSquare className="size-4" />
              Task Tracker
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">タスク管理</h1>
              <p className="text-sm leading-7 text-slate-600 md:text-base">
                {user.email} の自由タスクを管理します。締切なしタスクも登録可能です。
              </p>
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-brand-700">
                <Link href="/dashboard">ダッシュボードへ</Link>
                <Link href="/calendar">カレンダーへ</Link>
                <Link href="/assignments">課題管理へ</Link>
                <Link href="/classes">授業管理へ</Link>
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
            <p className="text-sm text-slate-500">総タスク数</p>
            <p className="text-3xl font-bold text-slate-950">{summary.total}</p>
          </Panel>
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">未完了</p>
            <p className="text-3xl font-bold text-amber-600">{summary.pending}</p>
          </Panel>
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">完了済み</p>
            <p className="text-3xl font-bold text-emerald-600">{summary.completed}</p>
          </Panel>
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">今日締切</p>
            <p className="text-3xl font-bold text-violet-600">{summary.dueToday}</p>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {taskList.length === 0 ? (
              <Panel className="space-y-4">
                <div className="inline-flex rounded-2xl bg-violet-50 p-3 text-violet-700">
                  <PlusCircle className="size-5" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-slate-950">最初のタスクを追加しましょう</h2>
                  <p className="leading-8 text-slate-600">
                    右側フォームからタスクを作成すると、締切順で一覧表示されます。
                  </p>
                </div>
              </Panel>
            ) : (
              taskList.map((task) => (
                <Panel className="space-y-5" key={task.id}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            task.status === "completed"
                              ? "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                              : "inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                          }
                        >
                          {task.status === "completed" ? "完了" : "未完了"}
                        </span>
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {task.due_date ? `締切 ${dateFormatter.format(new Date(task.due_date))}` : "締切なし"}
                        </span>
                      </div>
                      <h2 className="text-2xl font-semibold text-slate-950">{task.title}</h2>
                    </div>

                    <div className="flex flex-wrap gap-2 md:max-w-56 md:justify-end">
                      <form action={toggleTaskStatusAction}>
                        <input name="taskId" type="hidden" value={task.id} />
                        <input name="currentStatus" type="hidden" value={task.status} />
                        <Button type="submit" variant="secondary">
                          {task.status === "completed" ? "未完了に戻す" : "完了にする"}
                        </Button>
                      </form>
                      <Link href={`/tasks?edit=${task.id}`}>
                        <span className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                          編集
                        </span>
                      </Link>
                      <form action={deleteTaskAction}>
                        <input name="taskId" type="hidden" value={task.id} />
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
            <TaskForm
              action={editingTask ? updateTaskAction : createTaskAction}
              description={
                editingTask
                  ? "内容を更新すると一覧へ反映されます。完了状態は左側ボタンから切り替えます。"
                  : "タスク名と締切日を登録できます。締切日は空欄でも保存可能です。"
              }
              initialTask={editingTask}
              pendingLabel={editingTask ? "更新中..." : "作成中..."}
              submitLabel={editingTask ? "タスクを更新" : "タスクを作成"}
              title={editingTask ? "タスクを編集" : "新規タスクを作成"}
            />

            <Panel className="space-y-4 bg-slate-950 text-slate-50">
              <h2 className="text-xl font-semibold">運用メモ</h2>
              <ul className="space-y-3 text-sm leading-7 text-slate-300">
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  締切ありタスクが上に表示され、締切日でソートされます。
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  完了切り替えは Server Actions で即時反映されます。
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  期限が今日のタスクはダッシュボードとカレンダーにも表示されます。
                </li>
              </ul>
              {editingTask ? (
                <Link className="inline-flex text-sm font-semibold text-violet-200" href="/tasks">
                  編集をキャンセル
                </Link>
              ) : null}
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}
