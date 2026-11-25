"use client";

import { useActionState } from "react";
import { ubahPassword } from "@/actions/auth";
import FormField from "@/components/FormField";

const initialState = { ok: false, errors: {}, message: "" };

export default function UbahPasswordForm() {
  const [state, formAction, pending] = useActionState(ubahPassword, initialState);
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={`rounded-2xl border px-4 py-3 text-sm ${
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <FormField
        label="Password lama"
        name="password_lama"
        type="password"
        autoComplete="current-password"
        error={e.password_lama}
      />
      <FormField
        label="Password baru"
        name="password_baru"
        type="password"
        autoComplete="new-password"
        error={e.password_baru}
        helperText="8-72 karakter."
      />
      <FormField
        label="Konfirmasi password baru"
        name="konfirmasi"
        type="password"
        autoComplete="new-password"
        error={e.konfirmasi}
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Ubah Password"}
      </button>
    </form>
  );
}
