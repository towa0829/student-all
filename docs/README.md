# README.md

# Student's All

学生生活を一つのアプリで管理する Web アプリ．

管理できる内容

* 授業スケジュール
* 課題
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

### カレンダー

* 予定管理
* 授業表示
* バイト表示

### バイト管理

* シフト登録
* 勤務時間計算
* 月給自動計算

### ダッシュボード

* 今日の授業
* 今日の課題
* 今日の予定
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
│ ├ dashboard
│ ├ login
│ ├ shifts
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
	│ ├ home
	│ └ shifts
	├ lib
	└ types
```

---

# Current Progress

Step 7 完了

* プロジェクト構造の整理
* ホーム画面の実装
* 再利用 UI コンポーネント追加
* 型定義追加
* Supabase クライアント基盤追加
* Supabase SSR 構成追加
* middleware 追加
* SQL スキーマとセットアップ手順追加
* ログイン、サインアップ、ログアウト追加
* 認証保護ページ追加
* 課題 CRUD 追加
* 完了切り替え追加
* カレンダー画面追加
* 授業、課題、シフト、タスクの統合表示追加
* バイト管理 CRUD 追加
* 給料見込み集計追加
* 今日のダッシュボード追加

---

# Future Features

* AI課題管理
* シラバス自動解析
* 給料グラフ
* PWA化
