import Link from "next/link";
import { ShieldCheck, UserPlus } from "lucide-react";

import { AuthForm } from "@/features/auth/auth-form";
import { signInAction, signUpAction } from "@/actions/auth";

const benefits = [
  "課題と授業を user_id 単位で安全に分離",
  "Server Actions を使ってフォーム送信を単純化",
  "Supabase Auth と SSR セッション同期に対応"
] as const;

export function AuthPage({ nextPath }: { nextPath?: string }) {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-120 bg-[radial-gradient(circle_at_top_left,rgba(29,153,102,0.20),transparent_30%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_26%),linear-gradient(180deg,#effcf5_0%,#f8fafc_55%,#f8fafc_100%)]" />
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_1fr] lg:px-10 lg:py-14">
        <section className="rounded-4xl border border-white/70 bg-slate-950 px-8 py-10 text-slate-50 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.5)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
            <ShieldCheck className="size-4" />
            Step 3 Auth
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Student&apos;s All の認証基盤を有効化する
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
            このステップでは、Supabase Auth を使ってサインアップ、ログイン、ログアウト、保護ページへの導線を実装します。課題管理は次のステップでこのセッションを前提に構築します。
          </p>
          <ul className="mt-8 space-y-4 text-sm leading-7 text-slate-300">
            {benefits.map((benefit) => (
              <li className="flex items-start gap-3" key={benefit}>
                <UserPlus className="mt-1 size-4 shrink-0 text-brand-300" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <Link className="mt-10 inline-flex text-sm font-semibold text-brand-200" href="/">
            ホームに戻る
          </Link>
        </section>

        <section className="grid gap-6 self-center">
          <AuthForm
            action={signInAction}
            description="既存アカウントでログインして、課題管理画面へ進みます。"
            nextPath={nextPath}
            pendingLabel="ログイン中..."
            submitLabel="ログイン"
            title="ログイン"
          />
          <AuthForm
            action={signUpAction}
            description="初回利用時はこちら。Confirm email を有効にしている場合は確認メールが送信されます。"
            nextPath={nextPath}
            pendingLabel="登録中..."
            submitLabel="サインアップ"
            title="サインアップ"
          />
        </section>
      </div>
    </main>
  );
}
