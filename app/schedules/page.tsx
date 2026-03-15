import Link from "next/link";
import { CalendarClock, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";

import { signOutAction } from "@/actions/auth";
import {
  createScheduleAction,
  deleteScheduleAction,
  updateScheduleAction
} from "@/actions/schedules";
import { FeatureHeader } from "@/components/layout/feature-header";
import { Panel } from "@/components/ui/panel";
import { ScheduleForm } from "@/features/schedules/schedule-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type SchedulesPageProps = {
  searchParams: Promise<{
    edit?: string;
  }>;
};

function formatDateTime(dateTimeStr: string) {
  const [datePart, timePart] = dateTimeStr.split("T");

  return `${datePart.replace(/-/g, "/")} ${(timePart ?? "").slice(0, 5)}`;
}

export default async function SchedulesPage({ searchParams }: SchedulesPageProps) {
  const { edit } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/schedules");
  }

  const { data: schedules, error } = await supabase
    .from("schedules")
    .select("id, user_id, title, start_at, end_at, memo, created_at")
    .eq("user_id", user.id)
    .order("start_at", { ascending: true });

  if (error) {
    console.warn("Schedules query failed:", {
      code: error.code,
      message: error.message,
      table: "schedules"
    });
  }

  const scheduleList = error ? [] : (schedules ?? []);
  const editingSchedule = scheduleList.find((s) => s.id === edit);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-120 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_24%),linear-gradient(180deg,#f0fdfa_0%,#f8fafc_56%,#eff6ff_100%)]" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <FeatureHeader
          signOutAction={signOutAction}
          userLabel={user.email ?? "ユーザー"}
        />

        {error ? (
          <Panel className="border-amber-200 bg-amber-50">
            <p className="text-sm font-medium text-amber-800">
              スケジュールデータの取得に失敗したため、表示可能な情報のみを表示しています。
            </p>
          </Panel>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {scheduleList.length === 0 ? (
              <Panel className="space-y-4">
                <div className="inline-flex rounded-2xl bg-teal-50 p-3 text-teal-700">
                  <PlusCircle className="size-5" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-slate-950">最初のスケジュールを追加しましょう</h2>
                  <p className="leading-8 text-slate-600">
                    右側フォームから予定を作成すると、開始日時順で一覧表示されます。
                  </p>
                </div>
              </Panel>
            ) : (
              scheduleList.map((schedule) => (
                <Panel className="space-y-4" key={schedule.id}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                          <CalendarClock className="size-3" />
                          {formatDateTime(schedule.start_at)}
                        </span>
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          〜 {formatDateTime(schedule.end_at)}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-slate-950">{schedule.title}</h2>
                      {schedule.memo ? (
                        <p className="text-sm text-slate-500">{schedule.memo}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 md:max-w-48 md:justify-end">
                      <Link href={`/schedules?edit=${schedule.id}`}>
                        <span className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                          編集
                        </span>
                      </Link>
                      <form action={deleteScheduleAction}>
                        <input name="scheduleId" type="hidden" value={schedule.id} />
                        <button
                          className="inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                          type="submit"
                        >
                          削除
                        </button>
                      </form>
                    </div>
                  </div>
                </Panel>
              ))
            )}
          </div>

          <div className="space-y-4">
            <ScheduleForm
              action={editingSchedule ? updateScheduleAction : createScheduleAction}
              description={
                editingSchedule
                  ? "内容を更新すると一覧へ反映されます。"
                  : "タイトル・開始日時・終了日時を入力してください。"
              }
              initialSchedule={editingSchedule}
              pendingLabel={editingSchedule ? "更新中..." : "作成中..."}
              submitLabel={editingSchedule ? "スケジュールを更新" : "スケジュールを作成"}
              title={editingSchedule ? "スケジュールを編集" : "新規スケジュールを作成"}
            />

            {editingSchedule ? (
              <Link
                className="inline-flex text-sm font-semibold text-teal-700"
                href="/schedules"
              >
                編集をキャンセル
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
