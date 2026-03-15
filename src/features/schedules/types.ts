import type { Database } from "@/types/supabase";

export type ScheduleRecord = Database["public"]["Tables"]["schedules"]["Row"];

export interface ScheduleFormState {
  type: "idle" | "error";
  message: string;
}

export const initialScheduleFormState: ScheduleFormState = {
  type: "idle",
  message: ""
};
