"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { AssignmentSubmitButton } from "@/features/assignments/assignment-submit-button";
import {
  type AssignmentFormState,
  type AssignmentRecord,
  initialAssignmentFormState
} from "@/features/assignments/types";

type AssignmentFormProps = {
  action: (state: AssignmentFormState, formData: FormData) => Promise<AssignmentFormState>;
  initialAssignment?: AssignmentRecord;
  submitLabel: string;
  pendingLabel: string;
  title: string;
  description: string;
};

export function AssignmentForm({
  action,
  description,
  initialAssignment,
  pendingLabel,
  submitLabel,
  title
}: AssignmentFormProps) {
  const [state, formAction] = useActionState(action, initialAssignmentFormState);

  return (
    <Panel className="space-y-6 border-slate-200 bg-white">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </div>

      <form action={formAction} className="space-y-4">
        {initialAssignment ? <input name="assignmentId" type="hidden" value={initialAssignment.id} /> : null}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="assignment-title">
            課題名
          </label>
          <Input
            defaultValue={initialAssignment?.title ?? ""}
            id="assignment-title"
            maxLength={120}
            name="title"
            placeholder="例: 情報数学レポート"
            required
            type="text"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="assignment-due-date">
              締切日
            </label>
            <Input
              defaultValue={initialAssignment?.due_date ?? ""}
              id="assignment-due-date"
              name="dueDate"
              required
              type="date"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="assignment-memo">
            メモ
          </label>
          <textarea
            className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            defaultValue={initialAssignment?.memo ?? ""}
            id="assignment-memo"
            maxLength={500}
            name="memo"
            placeholder="提出形式、注意点、リンクなど"
          />
        </div>

        {state.type === "error" ? (
          <p className="text-sm text-rose-600" role="status">
            {state.message}
          </p>
        ) : null}

        <AssignmentSubmitButton idleLabel={submitLabel} pendingLabel={pendingLabel} />
      </form>
    </Panel>
  );
}
