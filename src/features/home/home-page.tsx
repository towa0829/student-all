import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock3, ListChecks, Wallet } from "lucide-react";
import Link from "next/link";

import { Panel } from "@/components/ui/panel";

const featureCards = [
  {
    title: "課題管理",
    description: "締切、進捗、メモをまとめて管理し、提出漏れを減らします。",
    icon: CheckCircle2
  },
  {
    title: "カレンダー",
    description: "授業、予定、バイト、課題を一つの視点で確認できます。",
    icon: CalendarDays
  },
  {
    title: "シフトと給料",
    description: "勤務時間と時給から収入見込みを自動で計算します。",
    icon: Wallet
  },
  {
    title: "授業・タスク",
    description: "時間割と自由タスクを管理し、カレンダーとダッシュボードへ連携します。",
    icon: ListChecks
  }
] as const;

const roadmap = [
  "Step 1: プロジェクト構造と UI 基盤",
  "Step 2: Supabase 設定と接続方針",
  "Step 3: 認証機能",
  "Step 4: 課題管理 CRUD",
  "Step 5: カレンダー",
  "Step 6: バイト管理",
  "Step 7: ダッシュボード",
  "Step 8: 授業とタスク CRUD"
] as const;

export function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-140 bg-[radial-gradient(circle_at_top_left,rgba(29,153,102,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_28%),linear-gradient(180deg,#f4fbf8_0%,#f8fafc_56%,#eef2ff_100%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-12 px-6 py-10 lg:px-10">
        <header className="flex flex-col gap-6 rounded-4xl border border-white/60 bg-white/70 px-8 py-8 shadow-[0_32px_100px_-48px_rgba(15,23,42,0.55)] backdrop-blur md:px-10">
          <div className="flex items-center gap-3 text-sm font-medium text-brand-700">
            <Clock3 className="size-4" />
            Student&apos;s All
          </div>
          <div className="grid gap-10 lg:grid-cols-[1.5fr_0.9fr] lg:items-end">
            <div className="space-y-5">
              <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
                Campus life operating system
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl md:leading-[1.05]">
                  授業も課題もバイトも、学生生活を一画面で整理する。
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                  Student&apos;s All は、授業・課題・予定・バイトシフト・給料・タスクを横断して管理するための学生向けダッシュボードです。Server Actions と Supabase を中心に、まずは認証と課題管理から段階的に構築します。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 sm:w-auto"
                  href="/login"
                >
                  ログインと登録を開く
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50 sm:w-auto"
                  href="/assignments"
                >
                  保護された課題画面へ
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
                  href="/calendar"
                >
                  月間カレンダーを見る
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
                  href="/shifts"
                >
                  バイト管理へ
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 sm:w-auto"
                  href="/classes"
                >
                  授業管理へ
                  <BookOpen className="size-4" />
                </Link>
                <Link
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 sm:w-auto"
                  href="/tasks"
                >
                  タスク管理へ
                  <ListChecks className="size-4" />
                </Link>
                <Link
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
                  href="/dashboard"
                >
                  今日のダッシュボードへ
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
            <Panel className="grid gap-5 bg-slate-950 text-slate-50">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand-300">
                  Build Roadmap
                </p>
                <h2 className="mt-3 text-2xl font-semibold">現在の開発ステップ</h2>
              </div>
              <ol className="space-y-3 text-sm text-slate-300">
                {roadmap.map((item, index) => (
                  <li
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    key={item}
                  >
                    <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-400/20 text-xs font-bold text-brand-200">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {featureCards.map(({ description, icon: Icon, title }) => (
            <Panel className="space-y-4" key={title}>
              <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
                <Icon className="size-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                <p className="leading-7 text-slate-600">{description}</p>
              </div>
            </Panel>
          ))}
        </section>
      </div>
    </main>
  );
}
