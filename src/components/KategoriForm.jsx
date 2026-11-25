"use client";

import { useActionState } from "react";
import Link from "next/link";
import FormField from "@/components/FormField";

// action: createKategori, atau updateKategori.bind(null, id)
export default function KategoriForm({ action, initial = {}, submitLabel }) {
  const [state, formAction, pending] = useActionState(action, {
    errors: {},
    message: "",
    values: initial,
  });
  const v = state.values;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </p>
      )}
      <FormField label="Nama kategori" name="nama" defaultValue={v.nama} error={state.errors.nama} />
      <FormField label="Kode" name="kode" defaultValue={v.kode} error={state.errors.kode} placeholder="Contoh: TI" />
      <div>
        <label htmlFor="deskripsi" className="mb-1.5 block text-sm font-medium text-slate-700">
          Deskripsi (opsional)
        </label>
        <textarea
          id="deskripsi"
          name="deskripsi"
          rows={3}
          defaultValue={v.deskripsi ?? ""}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
        {state.errors.deskripsi && (
          <p className="mt-1 text-xs text-rose-600">{state.errors.deskripsi}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : submitLabel}
        </button>
        <Link
          href="/dashboard/admin/kategori"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
