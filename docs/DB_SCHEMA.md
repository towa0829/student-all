# DB_SCHEMA.md

# Database Schema

---

# users

```
id
email
created_at
```

Supabase Auth の auth.users をベースに管理．

---

# classes

授業情報．

```
id
user_id
name
day_of_week
period
room
created_at
```

---

# assignments

課題管理．

```
id
user_id
class_id
title
due_date
status
memo
created_at
```

status

```
pending
completed
```

---

# shifts

バイト管理．

```
id
user_id
date
start_time
end_time
hourly_wage
created_at
```

給料計算

```
(end_time - start_time) × hourly_wage
```

---

# tasks

タスク管理．

```
id
user_id
title
due_date
status
created_at
```

---

# relationships

```
users
 ├ classes
 ├ assignments
 ├ shifts
 └ tasks
```

すべてのデータは user_id で紐付ける．
