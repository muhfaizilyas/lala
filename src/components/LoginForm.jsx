"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import FormField from "@/components/FormField";

const initialState = { errors: {}, message: "", values: {} };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-4" noValidate>
      {state.message ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </p>
      ) : null}

      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.values?.email ?? ""}
        error={state.errors?.email}
        placeholder="nama@student.kampus.ac.id"
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        error={state.errors?.password}
        placeholder="Password akunmu"
      />

      <button
        type="submit"
        disabled={pending}
        className="min-h-[44px] w-full rounded-xl bg-[#0f1f3d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#172d54] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
