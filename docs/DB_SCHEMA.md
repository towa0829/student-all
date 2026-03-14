# DB_SCHEMA.md

# Database Schema

---

# users

```
id
email
password
created_at
```

ユーザー情報を管理．

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
memo
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
