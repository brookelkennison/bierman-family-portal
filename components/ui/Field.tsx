"use client";

import { useId, useState, type ComponentProps } from "react";
import { Icon } from "./Icon";

type FieldProps = Omit<ComponentProps<"input">, "id" | "className"> & {
  label: string;
  /** Helper text under the input, like a format example. */
  hint?: string;
  /** Error message. Turns the border red and is read by screen readers. */
  error?: string;
};

const inputBase =
  "h-13 w-full rounded-input border bg-white px-4 text-body text-ink placeholder:text-placeholder transition-colors disabled:cursor-not-allowed disabled:bg-gray-tint";

function useFieldIds(hint?: string, error?: string) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  return { id, hintId, errorId, describedBy };
}

function borderFor(error?: string) {
  return error ? "border-danger" : "border-input-border hover:border-muted";
}

function Messages({
  hint,
  hintId,
  error,
  errorId,
}: {
  hint?: string;
  hintId?: string;
  error?: string;
  errorId?: string;
}) {
  return (
    <>
      {error && (
        <p
          id={errorId}
          className="flex items-start gap-1.5 text-small text-danger"
        >
          <Icon name="error" size={14} className="mt-0.75" />
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-small text-muted">
          {hint}
        </p>
      )}
    </>
  );
}

/** Label, input, and optional hint or error, wired together for screen readers. */
export function TextField({
  label,
  hint,
  error,
  type = "text",
  ...inputProps
}: FieldProps) {
  const { id, hintId, errorId, describedBy } = useFieldIds(hint, error);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-label text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${inputBase} ${borderFor(error)}`}
        {...inputProps}
      />
      <Messages hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}

/** Password input with a Show / Hide toggle. Paste and password managers work. */
export function PasswordField({
  label,
  hint,
  error,
  ...inputProps
}: Omit<FieldProps, "type">) {
  const { id, hintId, errorId, describedBy } = useFieldIds(hint, error);
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-label text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputBase} ${borderFor(error)} pr-24`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-controls={id}
          className="absolute inset-y-0 right-2 my-auto flex h-9 items-center gap-1.5 rounded-mark px-2 text-label text-navy hover:bg-navy-tint"
        >
          <Icon name={visible ? "hidePassword" : "showPassword"} />
          <span aria-hidden="true">{visible ? "Hide" : "Show"}</span>
        </button>
      </div>
      <Messages hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
