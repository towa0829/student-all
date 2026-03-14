import Link from "next/link";
import { CalendarClock, LogOut, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

import { signOutAction } from "@/actions/auth";
import { createShiftAction, deleteShiftAction, updateShiftAction } from "@/actions/shifts";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { ShiftForm } from "@/features/shifts/shift-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ShiftRecord } from "@/features/shifts/types";

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0
});

type ShiftsPageProps = {
  searchParams: Promise<{
    edit?: string;
    month?: string;
  }>;
};

function parseMonthParam(month?: string) {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;

  if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return new Date(year, monthIndex, 1);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getShiftDurationHours(shift: ShiftRecord) {
  const [startHour, startMinute] = shift.start_time.split(":").map(Number);
  const [endHour, endMinute] = shift.end_time.split(":").map(Number);

  return (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
}

function getSummary(shifts: ShiftRecord[]) {
  const totalHours = shifts.reduce((acc, shift) => acc + getShiftDurationHours(shift), 0);
  const totalPay = shifts.reduce((acc, shift) => acc + getShiftDurationHours(shift) * shift.hourly_wage, 0);

  return {
    shiftCount: shifts.length,
    totalHours,
    totalPay
  };
}

function createMonthLink(currentMonth: Date, offset: number) {
  const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
  const month = String(next.getMonth() + 1).padStart(2, "0");

  return `/shifts?month=${next.getFullYear()}-${month}`;
}

export default async function ShiftsPage({ searchParams }: ShiftsPageProps) {
  const { edit, month } = await searchParams;
  const currentMonth = parseMonthParam(month);
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const rangeStartKey = formatDateKey(monthStart);
  const rangeEndKey = formatDateKey(monthEnd);
  const monthFormatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long"
  });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/shifts");
  }

  const { data: shifts, error } = await supabase
    .from("shifts")
    .select("id, user_id, date, start_time, end_time, hourly_wage, created_at")
    .eq("user_id", user.id)
    .gte("date", rangeStartKey)
    .lte("date", rangeEndKey)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error("Failed to load shifts.");
  }

  const shiftList = shifts ?? [];
  const editingShift = shiftList.find((shift) => shift.id === edit);
  const summary = getSummary(shiftList);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-120 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_24%),linear-gradient(180deg,#ecfdf5_0%,#f8fafc_54%,#eef2ff_100%)]" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <header className="flex flex-col gap-5 rounded-4xl border border-white/70 bg-white/80 px-8 py-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              <Wallet className="size-4" />
              Shift & Wage
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">バイト管理</h1>
              <p className="text-sm leading-7 text-slate-600 md:text-base">
                {user.email} のシフトを月単位で管理し、勤務時間と給料見込みを自動計算します。
              </p>
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-brand-700">
                <Link href="/dashboard">ダッシュボードへ</Link>
                <Link href="/calendar">カレンダーへ</Link>
                <Link href="/assignments">課題管理へ</Link>
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

        <section className="grid gap-6 md:grid-cols-3">
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">対象月</p>
            <p className="text-2xl font-bold text-slate-950">{monthFormatter.format(currentMonth)}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                href={createMonthLink(currentMonth, -1)}
              >
                前月
              </Link>
              <Link
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                href={createMonthLink(currentMonth, 1)}
              >
                次月
              </Link>
            </div>
          </Panel>
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">シフト数</p>
            <p className="text-3xl font-bold text-slate-950">{summary.shiftCount}</p>
          </Panel>
          <Panel className="space-y-2">
            <p className="text-sm text-slate-500">合計勤務時間</p>
            <p className="text-3xl font-bold text-emerald-600">{summary.totalHours.toFixed(1)}h</p>
            <p className="text-xs text-slate-500">概算給料 {currencyFormatter.format(summary.totalPay)}</p>
          </Panel>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {shiftList.length === 0 ? (
              <Panel className="space-y-3">
                <h2 className="text-2xl font-semibold text-slate-950">シフトを登録しましょう</h2>
                <p className="leading-8 text-slate-600">
                  右側のフォームから勤務日、時間、時給を入力すると月間の勤務時間と給料見込みを集計できます。
                </p>
              </Panel>
            ) : (
              shiftList.map((shift) => {
                const durationHours = getShiftDurationHours(shift);
                const wage = durationHours * shift.hourly_wage;

                return (
                  <Panel className="space-y-4" key={shift.id}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {shift.date}
                        </p>
                        <h2 className="text-2xl font-semibold text-slate-950">
                          {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                        </h2>
                        <p className="text-sm text-slate-600">時給 {currencyFormatter.format(shift.hourly_wage)}</p>
                        <p className="text-sm text-slate-600">勤務時間 {durationHours.toFixed(2)}h</p>
                        <p className="text-sm font-semibold text-emerald-700">見込み給料 {currencyFormatter.format(wage)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 md:max-w-56 md:justify-end">
                        <Link href={`/shifts?edit=${shift.id}&month=${formatDateKey(currentMonth).slice(0, 7)}`}>
                          <span className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                            編集
                          </span>
                        </Link>
                        <form action={deleteShiftAction}>
                          <input name="shiftId" type="hidden" value={shift.id} />
                          <Button className="bg-rose-600 text-white shadow-none hover:bg-rose-700" type="submit">
                            削除
                          </Button>
                        </form>
                      </div>
                    </div>
                  </Panel>
                );
              })
            )}
          </div>

          <div className="space-y-4">
            <ShiftForm
              action={editingShift ? updateShiftAction : createShiftAction}
              description={
                editingShift
                  ? "勤務時間を更新すると月間集計に即時反映されます。"
                  : "終了時刻は開始時刻より後の時刻を入力してください。"
              }
              initialShift={editingShift}
              pendingLabel={editingShift ? "更新中..." : "作成中..."}
              submitLabel={editingShift ? "シフトを更新" : "シフトを作成"}
              title={editingShift ? "シフトを編集" : "新規シフトを作成"}
            />

            <Panel className="space-y-4 bg-slate-950 text-slate-50">
              <div className="inline-flex rounded-2xl bg-white/10 p-3 text-emerald-300">
                <CalendarClock className="size-5" />
              </div>
              <h2 className="text-xl font-semibold">計算ルール</h2>
              <ul className="space-y-3 text-sm leading-7 text-slate-300">
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  勤務時間 = 終了時刻 - 開始時刻
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  見込み給料 = 勤務時間 × 時給
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  ユーザー単位の RLS で他ユーザーのデータにはアクセスできません
                </li>
              </ul>
              {editingShift ? (
                <Link className="inline-flex text-sm font-semibold text-emerald-200" href="/shifts">
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
