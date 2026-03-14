import type { Database } from "@/types/supabase";

export type ClassRecord = Database["public"]["Tables"]["classes"]["Row"];

export interface ClassFormState {
  type: "idle" | "error";
  message: string;
}

export const initialClassFormState: ClassFormState = {
  type: "idle",
  message: ""
};

export const dayOptions = [
  { label: "日", value: 0 },
  { label: "月", value: 1 },
  { label: "火", value: 2 },
  { label: "水", value: 3 },
  { label: "木", value: 4 },
  { label: "金", value: 5 },
  { label: "土", value: 6 }
] as const;
