# API_SPEC.md

# API Specification

---

# Assignments

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

---

# Tasks

## Create Task

POST

```
/api/tasks
```

---

# Classes

## Create Class

POST

```
/api/classes
```
