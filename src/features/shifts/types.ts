import type { Database } from "@/types/supabase";

export type ShiftRecord = Database["public"]["Tables"]["shifts"]["Row"];

export interface ShiftFormState {
  type: "idle" | "error";
  message: string;
}

export const initialShiftFormState: ShiftFormState = {
  type: "idle",
  message: ""
};
