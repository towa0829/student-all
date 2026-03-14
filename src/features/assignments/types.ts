import type { Database } from "@/types/supabase";

export type AssignmentRecord = Database["public"]["Tables"]["assignments"]["Row"];
export type ClassRecord = Database["public"]["Tables"]["classes"]["Row"];

export interface AssignmentFormState {
  type: "idle" | "error";
  message: string;
}

export const initialAssignmentFormState: AssignmentFormState = {
  type: "idle",
  message: ""
};
