"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";
import FormField from "@/components/FormField";

const initialState = { errors: {}, message: "", values: {} };

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState
  );
  const values = state.values ?? {};
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="mt-7 grid gap-4 sm:grid-cols-2" noValidate>
      {state.message ? (
        <p
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:col-span-2"
        >
          {state.message}
        </p>
      ) : null}

      <FormField
        label="Nama lengkap"
        name="nama_lengkap"
        autoComplete="name"
        defaultValue={values.nama_lengkap ?? ""}
        error={errors.nama_lengkap}
        placeholder="Nama lengkap kamu"
      />
      <FormField
        label="Email kampus"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={values.email ?? ""}
        error={errors.email}
        placeholder="nama@student.kampus.ac.id"
      />
      <FormField
        label="NIM"
        name="nomor_identitas"
        inputMode="numeric"
        autoComplete="off"
        defaultValue={values.nomor_identitas ?? ""}
        error={errors.nomor_identitas}
        placeholder="Nomor induk mahasiswa"
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        error={errors.password}
        placeholder="Minimal 8 karakter"
      />
      <div className="sm:col-span-2">
        <FormField
          label="Konfirmasi password"
          name="konfirmasi"
          type="password"
          autoComplete="new-password"
          error={errors.konfirmasi}
          placeholder="Ulangi password"
        />
      </div>

      <div className="sm:col-span-2">
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
            i
          </span>
          <p className="text-xs leading-5 text-sky-800">
            Pendaftaran ini khusus mahasiswa. Peran akun akan ditetapkan otomatis
            sebagai <strong>Mahasiswa</strong> oleh sistem.
          </p>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Mendaftarkan..." : "Daftar"}
        </button>
      </div>
    </form>
  );
}
