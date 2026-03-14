# API_SPEC.md

# API Specification

このプロジェクトでは Server Actions を優先するが，外部連携や将来の拡張用に Route Handler ベースの API 仕様も整理する．

---

# Assignments

実装方針

* UI からは Server Actions を優先使用
* API Route は将来の外部連携用に維持

## Create Assignment

POST

```
/api/assignments
```

Body

```
{
 title: string
 due_date: date
 class_id: number
 memo: string
}
```

---

## Get Assignments

GET

```
/api/assignments
```

Response

```
[
 {
  id
  title
  due_date
  status
 }
]
```

---

## Update Assignment

PATCH

```
/api/assignments/:id
```

更新対象

```
title
due_date
class_id
memo
status
```

---

## Delete Assignment

DELETE

```
/api/assignments/:id
```

---

# Shifts

## Create Shift

POST

```
/api/shifts
```

Body

```
{
 date
 start_time
 end_time
 hourly_wage
}
```

## Update Shift

PATCH

```
/api/shifts/:id
```

Body

```
{
 date
 start_time
 end_time
 hourly_wage
}
```

## Delete Shift

DELETE

```
/api/shifts/:id
```

---

# Calendar

実装方針

* App Router の Server Component で月単位にデータ取得
* classes は day_of_week を元に月間へ展開
* assignments、shifts、tasks は日付ベースで集約

---

# Dashboard

実装方針

* 今日の日付で classes、assignments、shifts、tasks を横断集計
* 画面表示は Server Component で実行
* 認証済みユーザーのみアクセス可能

---

# Tasks

## Create Task

POST

```
/api/tasks
```

## Get Tasks

GET

```
/api/tasks
```

## Update Task

PATCH

```
/api/tasks/:id
```

更新対象

```
title
due_date
status
```

## Delete Task

DELETE

```
/api/tasks/:id
```

---

# Classes

## Create Class

POST

```
/api/classes
```

## Get Classes

GET

```
/api/classes
```

## Update Class

PATCH

```
/api/classes/:id
```

更新対象

```
name
day_of_week
period
room
```

## Delete Class

DELETE

```
/api/classes/:id
```

---

# Authentication and Access

実装方針

* proxy で protected route を検査
* 現在の protected route: /assignments, /calendar, /shifts, /dashboard, /classes, /tasks
* 未認証時は /login?next=... へ遷移
