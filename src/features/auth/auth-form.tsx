"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import {
  type AuthActionState,
  initialAuthActionState
} from "@/features/auth/types";
import { AuthSubmitButton } from "@/features/auth/auth-submit-button";

type AuthFormProps = {
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  description: string;
  nextPath?: string;
  pendingLabel: string;
  submitLabel: string;
  title: string;
};

export function AuthForm({
  action,
  description,
  nextPath,
  pendingLabel,
  submitLabel,
  title
}: AuthFormProps) {
  const [state, formAction] = useActionState(action, initialAuthActionState);

  return (
    <Panel className="space-y-6 border-slate-200 bg-white">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </div>
      <form action={formAction} className="space-y-4">
        {nextPath ? <input name="next" type="hidden" value={nextPath} /> : null}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor={`${title}-email`}>
            メールアドレス
          </label>
          <Input id={`${title}-email`} name="email" placeholder="student@example.com" required type="email" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor={`${title}-password`}>
            パスワード
          </label>
          <Input
            id={`${title}-password`}
            minLength={8}
            name="password"
            placeholder="8文字以上で入力"
            required
            type="password"
          />
        </div>
        {state.type !== "idle" ? (
          <p
            className={state.type === "error" ? "text-sm text-rose-600" : "text-sm text-brand-700"}
            role="status"
          >
            {state.message}
          </p>
        ) : null}
        <AuthSubmitButton idleLabel={submitLabel} pendingLabel={pendingLabel} />
      </form>
    </Panel>
  );
}
