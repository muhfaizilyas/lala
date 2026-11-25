"use client";

import { useActionState } from "react";
import Link from "next/link";
import FormField from "@/components/FormField";
import { KATEGORI_PENGUMUMAN, STATUS_PENGUMUMAN } from "@/lib/validation";

const kontrol =
  "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

// action: createPengumuman, atau updatePengumuman.bind(null, id)
export default function PengumumanForm({ action, initial = {}, submitLabel }) {
  const [state, formAction, pending] = useActionState(action, {
    errors: {},
    message: "",
    values: initial,
  });
  const v = state.values;
  const e = state.errors;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </p>
      )}

      <FormField label="Judul pengumuman" name="judul" defaultValue={v.judul} error={e.judul} />

      <div>
        <label htmlFor="konten" className="mb-1.5 block text-sm font-medium text-slate-700">
          Isi pengumuman
        </label>
        <textarea
          id="konten"
          name="konten"
          rows={7}
          defaultValue={v.konten ?? ""}
          aria-invalid={e.konten ? "true" : undefined}
          className={`${kontrol} ${e.konten ? "border-rose-400" : "border-slate-200"}`}
        />
        {e.konten && <p className="mt-1.5 text-xs text-rose-600">{e.konten}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="kategori" className="mb-1.5 block text-sm font-medium text-slate-700">
            Kategori
          </label>
          <select
            id="kategori"
            name="kategori"
            defaultValue={v.kategori ?? ""}
            className={`${kontrol} ${e.kategori ? "border-rose-400" : "border-slate-200"}`}
          >
            <option value="">Pilih kategori</option>
            {KATEGORI_PENGUMUMAN.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          {e.kategori && <p className="mt-1.5 text-xs text-rose-600">{e.kategori}</p>}
        </div>

        <FormField
          label="Tanggal rilis"
          name="tanggal_rilis"
          type="date"
          defaultValue={v.tanggal_rilis}
          error={e.tanggal_rilis}
        />

        <div>
          <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-slate-700">
            Status publikasi
          </label>
          <select
            id="status"
            name="status"
            defaultValue={v.status ?? "Draft"}
            className={`${kontrol} ${e.status ? "border-rose-400" : "border-slate-200"}`}
          >
            {STATUS_PENGUMUMAN.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {e.status && <p className="mt-1.5 text-xs text-rose-600">{e.status}</p>}
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Hanya pengumuman berstatus Published yang tampil di halaman publik.
      </p>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : submitLabel}
        </button>
        <Link
          href="/dashboard/pengumuman"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
