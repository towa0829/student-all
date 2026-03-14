# README.md

# Student's All

学生生活を一つのアプリで管理するWebアプリ．

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

* Next.js
* React
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
git clone https://github.com/yourname/student-life-manager
cd student-life-manager
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

```
src
 ├ app
 ├ components
 ├ lib
 ├ hooks
 ├ types
 └ utils
```

---

# Future Features

* AI課題管理
* シラバス自動解析
* 給料グラフ
* PWA化
