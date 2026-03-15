# README.md

# Student's All

学生生活を一つのアプリで管理する Web アプリ．

管理できる内容

* 授業スケジュール
* 課題
* スケジュール
* カレンダー
* バイトシフト
* バイト給料
* タスク

複数のアプリを使い分ける必要をなくし，学生生活の管理を簡単にすることを目的とする．

---

# Tech Stack

Frontend

* Next.js (App Router)
* React
* TypeScript
* TailwindCSS

Backend

* Supabase
* PostgreSQL

Auth

* Supabase Auth

---

# Features

### 課題管理

* 課題登録
* 締切管理
* 完了チェック

### タスク管理

* タスク登録
* 期限管理
* 完了チェック

### スケジュール管理

* スケジュール登録
* 開始日時/終了日時管理
* 複数日予定対応

### カレンダー

* 授業表示
* 課題表示
* タスク表示
* バイト表示
* スケジュール表示
* 日付クリックからモーダル追加

### バイト管理

* シフト登録
* 勤務先管理
* 勤務時間計算
* 月給自動計算

### ダッシュボード

* 今日の課題
* 今日のタスク
* 今日のスケジュール
* 今日のバイト

---

# Setup

```bash
npm install
npm run dev
```

---

# Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

# Folder Structure

```text
.
├ app
│ ├ assignments
│ ├ calendar
│ ├ classes
│ ├ dashboard
│ ├ login
│ ├ shifts
│ ├ tasks
│ ├ globals.css
│ ├ layout.tsx
│ └ page.tsx
├ docs
├ supabase
├ public
└ src
	├ actions
	├ components
	│ ├ layout
	│ └ ui
	├ features
	│ ├ assignments
	│ ├ auth
	│ ├ calendar
	│ ├ classes
	│ ├ home
	│ ├ shifts
	│ └ tasks
	├ lib
	└ types
```

---

# Status

主要機能の実装とデプロイは完了．

---

# Deployment

* Vercel を想定
* 環境変数は `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* Supabase 側で `Site URL`, `Redirect URLs` に本番 URL を設定
* DB 初期化は [supabase/schema.sql](../supabase/schema.sql) を使用
