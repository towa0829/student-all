import type { Database } from "@/types/supabase";

export type TaskRecord = Database["public"]["Tables"]["tasks"]["Row"];

export interface TaskFormState {
  type: "idle" | "error";
  message: string;
}

export const initialTaskFormState: TaskFormState = {
  type: "idle",
  message: ""
};
