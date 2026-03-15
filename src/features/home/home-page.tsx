import { ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";

import { Panel } from "@/components/ui/panel";

export function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[linear-gradient(180deg,#eef2f7_0%,#f8fafc_55%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-10 lg:px-10">
        <Panel className="w-full space-y-8 border-white/70 bg-white/80 px-8 py-10 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.45)] backdrop-blur md:px-12">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand-700">Student&apos;s All</p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              学生生活をシンプルに管理する
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              課題、授業、シフト、タスクをひとつのアプリでまとめて管理できます。まずはログインして利用を開始してください。
            </p>
          </div>

          <div>
            <Link
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 sm:w-auto"
              href="/login"
            >
              <LogIn className="size-4" />
              ログイン画面へ
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Panel>
      </div>
    </main>
  );
}
