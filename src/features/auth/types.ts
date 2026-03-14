export interface AuthActionState {
  type: "idle" | "success" | "error";
  message: string;
}

export const initialAuthActionState: AuthActionState = {
  type: "idle",
  message: ""
};
