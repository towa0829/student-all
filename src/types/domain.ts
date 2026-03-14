export type AssignmentStatus = "pending" | "completed";
export type TaskStatus = "pending" | "completed";

export interface AppUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface SchoolClass {
  id: string;
  userId: string;
  name: string;
  dayOfWeek: number;
  period: number;
  room: string;
}

export interface Assignment {
  id: string;
  userId: string;
  classId: string | null;
  title: string;
  dueDate: string;
  status: AssignmentStatus;
  memo: string | null;
}

export interface Shift {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyWage: number;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  dueDate: string | null;
  status: TaskStatus;
}
