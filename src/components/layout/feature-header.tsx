import { CircleUserRound, LogOut } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type HeaderLink = {
  href: string;
  label: string;
};

type FeatureHeaderProps = {
  links?: HeaderLink[];
  signOutAction: () => Promise<void>;
  userLabel?: string | null;
};

const defaultHeaderLinks: HeaderLink[] = [
  { href: "/dashboard", label: "ダッシュボード" },
  { href: "/calendar", label: "カレンダー" },
  { href: "/assignments", label: "課題管理" },
  { href: "/classes", label: "授業管理" },
  { href: "/tasks", label: "タスク管理" },
  { href: "/shifts", label: "バイト管理" }
];

export function FeatureHeader({
  links = defaultHeaderLinks,
  signOutAction,
  userLabel
}: FeatureHeaderProps) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="flex items-center justify-between gap-4 py-3">
            <p className="text-sm font-bold tracking-wide text-slate-900 md:text-base">Student&apos;s All</p>

            <details className="group relative">
              <summary className="flex list-none cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-50">
                <CircleUserRound className="size-5" />
              </summary>

              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">ユーザー情報</p>
                <p className="mt-2 break-all text-sm text-slate-700">{userLabel ?? "メールアドレス未設定"}</p>

                <form action={signOutAction} className="mt-4">
                  <Button className="w-full" type="submit" variant="secondary">
                    <span className="inline-flex items-center gap-2">
                      <LogOut className="size-4" />
                      ログアウト
                    </span>
                  </Button>
                </form>
              </div>
            </details>
          </div>

          <nav className="flex flex-wrap gap-3 pb-3 text-sm font-semibold text-brand-700">
            {links.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="h-34 md:h-38" />
    </>
  );
}
