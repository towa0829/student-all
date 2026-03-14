# Student's All

Student's All は、授業・課題・予定・バイトシフト・給料・タスクを一つのアプリで管理する学生生活向け Web アプリです。

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS v4
- Supabase
- PostgreSQL
- Supabase Auth

## Current Step

現在は Step 6 まで実装済みです。

- プロジェクト構造の整理
- 再利用 UI コンポーネントの追加
- ホーム画面とプレースホルダーページの追加
- 型定義と Supabase クライアント基盤の整備
- Supabase SSR クライアントの分離
- middleware によるセッション同期
- SQL スキーマと RLS セットアップ手順の追加
- ログイン、サインアップ、ログアウトの実装
- /assignments への認証保護追加
- assignments テーブルの CRUD 実装
- 完了切り替えと締切順一覧の実装
- 月間カレンダー画面の実装
- classes、assignments、shifts、tasks の統合表示
- shifts テーブルの CRUD 実装
- 勤務時間と給料見込みの月間集計

次の Step ではダッシュボードへ拡張します。

## Package Overview

- next, react, react-dom: App Router ベースのフロントエンド実装
- @supabase/supabase-js: Supabase の認証とデータアクセス
- lucide-react: 軽量アイコン
- clsx, tailwind-merge: 再利用 UI の className 組み立て

## Getting Started

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開くと確認できます。

## Environment Variables

`.env.local` に以下を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Supabase の初期化手順は [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) にまとめています。

## Directory Structure

```text
.
├─ app
│  ├─ assignments
│  ├─ calendar
│  ├─ login
│  ├─ shifts
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ docs
├─ supabase
├─ public
└─ src
	├─ actions
	├─ components
	│  ├─ layout
	│  └─ ui
	├─ features
	│  ├─ assignments
	│  ├─ auth
	│  ├─ calendar
	│  ├─ home
	│  └─ shifts
	├─ lib
	└─ types
```

## Development Notes

- Server Actions を優先して実装する方針です。
- 認証後の各機能は user_id を軸に Supabase 側で分離します。
- docs フォルダの仕様を基準に進め、実装差分が出た場合はドキュメントも更新します。
