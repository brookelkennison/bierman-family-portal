"use client";

import { useActionState, useEffect, useRef } from "react";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { PasswordField, TextField } from "@/components/ui/Field";
import { login, type LoginState } from "@/app/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );
  const errorRef = useRef<HTMLDivElement>(null);

  // Move focus to the error so screen readers announce it (Figma 02).
  useEffect(() => {
    if (state.error) errorRef.current?.focus();
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-5.5">
      {state.error && (
        <Banner tone="error" title="We couldn't log you in" ref={errorRef}>
          {state.error}
        </Banner>
      )}
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        defaultValue={state.email}
        required
      />
      <PasswordField
        label="Password"
        name="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
      />
      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={pending}
        className="mt-5"
      >
        {pending ? "Logging in" : "Log in"}
      </Button>
      <p className="text-center text-label font-normal text-muted">
        Need access?{" "}
        <strong className="font-semibold text-navy">
          Contact your center.
        </strong>
      </p>
    </form>
  );
}
