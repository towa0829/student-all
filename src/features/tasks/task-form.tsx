"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { TaskSubmitButton } from "@/features/tasks/task-submit-button";
import {
  type TaskFormState,
  type TaskRecord,
  initialTaskFormState
} from "@/features/tasks/types";

type TaskFormProps = {
  action: (state: TaskFormState, formData: FormData) => Promise<TaskFormState>;
  description: string;
  initialTask?: TaskRecord;
  pendingLabel: string;
  submitLabel: string;
  title: string;
};

export function TaskForm({
  action,
  description,
  initialTask,
  pendingLabel,
  submitLabel,
  title
}: TaskFormProps) {
  const [state, formAction] = useActionState(action, initialTaskFormState);

  return (
    <Panel className="space-y-6 border-slate-200 bg-white">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </div>

      <form action={formAction} className="space-y-4">
        {initialTask ? <input name="taskId" type="hidden" value={initialTask.id} /> : null}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="task-title">
            タスク名
          </label>
          <Input
            defaultValue={initialTask?.title ?? ""}
            id="task-title"
            maxLength={120}
            name="title"
            placeholder="例: レポート提出チェック"
            required
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="task-due-date">
            締切日
          </label>
          <Input
            defaultValue={initialTask?.due_date ?? ""}
            id="task-due-date"
            name="dueDate"
            type="date"
          />
        </div>

        {state.type === "error" ? (
          <p className="text-sm text-rose-600" role="status">
            {state.message}
          </p>
        ) : null}

        <TaskSubmitButton idleLabel={submitLabel} pendingLabel={pendingLabel} />
      </form>
    </Panel>
  );
}
