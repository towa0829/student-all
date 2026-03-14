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
* API呼び出し
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

---

# Authentication Flow

```
User Login
   ↓
Supabase Auth
   ↓
JWT発行
   ↓
Session管理
```

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
