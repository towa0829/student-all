# SYSTEM_ARCHITECTURE.md

# System Architecture

このアプリは **Next.js + Supabase** を使用したフルスタック構成．

---

# Architecture Overview

```
Frontend (Next.js)

    ↓

API Layer
(Server Actions / Route Handlers)

    ↓

Supabase

    ↓

PostgreSQL
```

---

# Frontend

Next.js App Routerを使用．

役割

* UI表示
* Server Actions 呼び出し
* 状態管理

---

# Backend

Supabaseを使用．

機能

* Database
* Authentication
* Storage

---

# Data Flow

例：課題作成

```
User Input
   ↓
React Form
   ↓
Server Action
   ↓
Supabase Insert
   ↓
Database
```

カレンダー表示では classes の繰り返し授業情報と assignments、shifts、tasks の日付データをサーバー側で集約してから UI に渡す．

バイト管理では shifts を基に勤務時間と給料見込みをサーバー側で集計し，月間サマリーとして表示する．

---

# Authentication Flow

```
User Login
   ↓
Server Action
   ↓
Supabase Auth
   ↓
JWT発行
   ↓
middleware で Session 管理
   ↓
Protected Route Access
```

---

# App Integration

アプリ側では用途ごとに Supabase クライアントを分離する．

* Browser Client
* Server Client
* Middleware Client

これにより App Router の Server Actions と認証セッション更新を安全に扱う．

---

# Deployment

予定

* Vercel
* Supabase Cloud

---

# Scalability

将来

* Redisキャッシュ
* Edge Functions
* Notification system
