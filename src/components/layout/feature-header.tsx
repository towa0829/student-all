"use client";

import { CircleUserRound, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  { href: "/schedules", label: "スケジュール" },
  { href: "/assignments", label: "課題管理" },
  { href: "/tasks", label: "タスク管理" },
  { href: "/shifts", label: "バイト管理" }
];

export function FeatureHeader({
  links = defaultHeaderLinks,
  signOutAction,
  userLabel
}: FeatureHeaderProps) {
  const pathname = usePathname();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-600">Planner</p>
              <p className="text-sm font-bold tracking-wide text-slate-900 md:text-base">Student&apos;s All</p>
            </div>

            <details className="group relative">
              <summary className="flex list-none cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700">
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

          <nav className="flex flex-wrap gap-2 pb-3">
            {links.map((link) => (
              <Link
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  pathname === link.href
                    ? "bg-slate-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                )}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="h-16 md:h-20" />
    </>
  );
}
