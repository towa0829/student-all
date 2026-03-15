import { CheckCircle2, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

import { signOutAction } from "@/actions/auth";
import { FeatureHeader } from "@/components/layout/feature-header";
import { Panel } from "@/components/ui/panel";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getShiftDurationHours(startTime: string, endTime: string) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  return (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
}

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0
});

export default async function DashboardPage() {
  const now = new Date();
  const todayKey = formatDateKey(now);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [assignmentsResult, shiftsResult, tasksResult] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, title, due_date, status")
      .eq("user_id", user.id)
      .eq("due_date", todayKey)
      .order("created_at", { ascending: true }),
    supabase
      .from("shifts")
      .select("id, date, start_time, end_time, hourly_wage")
      .eq("user_id", user.id)
      .eq("date", todayKey)
      .order("start_time", { ascending: true }),
    supabase
      .from("tasks")
      .select("id, title, due_date, status")
      .eq("user_id", user.id)
      .eq("due_date", todayKey)
      .order("created_at", { ascending: true })
  ]);

  const queryErrors = [
    { error: assignmentsResult.error, table: "assignments" },
    { error: shiftsResult.error, table: "shifts" },
    { error: tasksResult.error, table: "tasks" }
  ].filter((item) => item.error);

  if (queryErrors.length > 0) {
    console.warn(
      "Dashboard query failed:",
      queryErrors.map((item) => ({
        code: item.error?.code,
        message: item.error?.message,
        table: item.table
      }))
    );
  }

  const assignments = assignmentsResult.error ? [] : (assignmentsResult.data ?? []);
  const shifts = shiftsResult.error ? [] : (shiftsResult.data ?? []);
  const tasks = tasksResult.error ? [] : (tasksResult.data ?? []);

  const todayShiftPay = shifts.reduce((acc, shift) => {
    return acc + getShiftDurationHours(shift.start_time, shift.end_time) * shift.hourly_wage;
  }, 0);

  const pendingAssignments = assignments.filter((item) => item.status === "pending").length;
  const pendingTasks = tasks.filter((item) => item.status === "pending").length;

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[linear-gradient(180deg,#eef2f7_0%,#f8fafc_55%)]" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <FeatureHeader
          signOutAction={signOutAction}
          userLabel={user.email ?? "ユーザー"}
        />

        {queryErrors.length > 0 ? (
          <Panel className="border-amber-200 bg-amber-50">
            <p className="text-sm font-medium text-amber-800">
              一部データの取得に失敗したため、表示可能な情報のみを表示しています。詳細はサーバーログを確認してください。
            </p>
          </Panel>
        ) : null}

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">課題（未完了）</p>
            <p className="text-3xl font-bold text-amber-600">{pendingAssignments}</p>
          </Panel>
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">タスク（未完了）</p>
            <p className="text-3xl font-bold text-violet-600">{pendingTasks}</p>
          </Panel>
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">本日のシフト見込み</p>
            <p className="text-2xl font-bold text-emerald-600">{currencyFormatter.format(todayShiftPay)}</p>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel className="space-y-4">
            <div className="inline-flex rounded-2xl bg-amber-50 p-3 text-amber-700">
              <CheckCircle2 className="size-5" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-950">今日の課題とタスク</h2>
            {assignments.length === 0 && tasks.length === 0 ? (
              <p className="text-sm leading-7 text-slate-600">今日締切の課題・タスクはありません。</p>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3" key={assignment.id}>
                    <p className="font-semibold text-amber-900">課題: {assignment.title}</p>
                    <p className="text-sm text-amber-700">
                      状態: {assignment.status === "completed" ? "完了" : "未完了"}
                    </p>
                  </div>
                ))}
                {tasks.map((task) => (
                  <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3" key={task.id}>
                    <p className="font-semibold text-violet-900">タスク: {task.title}</p>
                    <p className="text-sm text-violet-700">
                      状態: {task.status === "completed" ? "完了" : "未完了"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel className="space-y-4 lg:col-span-2">
            <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Wallet className="size-5" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-950">今日のバイト</h2>
            {shifts.length === 0 ? (
              <p className="text-sm leading-7 text-slate-600">今日のシフトは登録されていません。</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {shifts.map((shift) => {
                  const hours = getShiftDurationHours(shift.start_time, shift.end_time);
                  const pay = hours * shift.hourly_wage;

                  return (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3" key={shift.id}>
                      <p className="font-semibold text-emerald-900">
                        {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                      </p>
                      <p className="text-sm text-emerald-700">勤務時間 {hours.toFixed(2)}h</p>
                      <p className="text-sm text-emerald-700">時給 {currencyFormatter.format(shift.hourly_wage)}</p>
                      <p className="text-sm font-semibold text-emerald-800">見込み給料 {currencyFormatter.format(pay)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </section>
      </div>
    </main>
  );
}
