import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";

import { signOutAction } from "@/actions/auth";
import { createClassAction, deleteClassAction, updateClassAction } from "@/actions/classes";
import { Button } from "@/components/ui/button";
import { FeatureHeader } from "@/components/layout/feature-header";
import { Panel } from "@/components/ui/panel";
import { ClassForm } from "@/features/classes/class-form";
import { dayOptions } from "@/features/classes/types";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const dayMap: Record<number, string> = dayOptions.reduce(
  (acc, day) => ({
    ...acc,
    [day.value]: day.label
  }),
  {}
);

type ClassesPageProps = {
  searchParams: Promise<{
    edit?: string;
  }>;
};

export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  const { edit } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/classes");
  }

  const { data: classes, error } = await supabase
    .from("classes")
    .select("id, user_id, name, day_of_week, period, room, created_at")
    .eq("user_id", user.id)
    .order("day_of_week", { ascending: true })
    .order("period", { ascending: true });

  if (error) {
    console.warn("Classes query failed:", {
      code: error.code,
      message: error.message,
      table: "classes"
    });
  }

  const classList = error ? [] : (classes ?? []);
  const editingClass = classList.find((schoolClass) => schoolClass.id === edit);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-120 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_24%),linear-gradient(180deg,#f0f9ff_0%,#f8fafc_56%,#eef2ff_100%)]" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <FeatureHeader
          signOutAction={signOutAction}
          userLabel={user.email ?? "ユーザー"}
        />

        {error ? (
          <Panel className="border-amber-200 bg-amber-50">
            <p className="text-sm font-medium text-amber-800">
              授業データの取得に失敗したため、表示可能な情報のみを表示しています。
            </p>
          </Panel>
        ) : null}

        <section className="grid gap-6 md:grid-cols-3">
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">登録授業数</p>
            <p className="text-3xl font-bold text-slate-950">{classList.length}</p>
          </Panel>
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">曜日カバー数</p>
            <p className="text-3xl font-bold text-sky-600">{new Set(classList.map((item) => item.day_of_week)).size}</p>
          </Panel>
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">次のステップ</p>
            <p className="text-sm leading-7 text-slate-600">授業登録後、課題作成時に授業との紐付けができます。</p>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {classList.length === 0 ? (
              <Panel className="space-y-4">
                <div className="inline-flex rounded-2xl bg-sky-50 p-3 text-sky-700">
                  <PlusCircle className="size-5" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-slate-950">最初の授業を追加しましょう</h2>
                  <p className="leading-8 text-slate-600">
                    右側フォームから授業を登録すると、曜日と時限で自動的に整理して表示します。
                  </p>
                </div>
              </Panel>
            ) : (
              classList.map((schoolClass) => (
                <Panel className="space-y-4" key={schoolClass.id}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <p className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {dayMap[schoolClass.day_of_week] ?? "-"}曜日 {schoolClass.period}限
                      </p>
                      <h2 className="text-2xl font-semibold text-slate-950">{schoolClass.name}</h2>
                      <p className="text-sm text-slate-600">教室: {schoolClass.room}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 md:max-w-56 md:justify-end">
                      <Link href={`/classes?edit=${schoolClass.id}`}>
                        <span className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                          編集
                        </span>
                      </Link>
                      <form action={deleteClassAction}>
                        <input name="classId" type="hidden" value={schoolClass.id} />
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
            <ClassForm
              action={editingClass ? updateClassAction : createClassAction}
              description={
                editingClass
                  ? "授業情報を更新するとカレンダー・ダッシュボード表示にも反映されます。"
                  : "授業名、曜日、時限、教室を登録できます。"
              }
              initialClass={editingClass}
              pendingLabel={editingClass ? "更新中..." : "作成中..."}
              submitLabel={editingClass ? "授業を更新" : "授業を作成"}
              title={editingClass ? "授業を編集" : "新規授業を作成"}
            />

            {editingClass ? (
              <Link className="inline-flex text-sm font-semibold text-sky-700" href="/classes">
                編集をキャンセル
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
