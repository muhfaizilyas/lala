"use client";

import { useActionState, startTransition } from "react";
import Link from "next/link";
import FormField from "@/components/FormField";

// action: createBuku, atau updateBuku.bind(null, id)
export default function BukuForm({ action, categories, initial = {}, submitLabel, isEdit = false }) {
  const [state, formAction, pending] = useActionState(action, {
    errors: {},
    message: "",
    values: initial,
  });
  const v = state.values;
  const e = state.errors;

  // React 19 otomatis mereset form setelah <form action={...}> selesai, dan dropdown
  // ikut kosong. Dengan menangani submit sendiri, form tidak di-reset dan semua
  // isian tetap ada saat ada error validasi.
  function handleSubmit(ev) {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {state.message && (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </p>
      )}

      <FormField label="Judul" name="judul" defaultValue={v.judul} error={e.judul} />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="ISBN" name="isbn" defaultValue={v.isbn} error={e.isbn} placeholder="978-602-1234-56-7" />
        <FormField label="Tahun terbit" name="tahun_terbit" defaultValue={v.tahun_terbit} error={e.tahun_terbit} />
        <FormField label="Pengarang" name="pengarang" defaultValue={v.pengarang} error={e.pengarang} />
        <FormField label="Penerbit" name="penerbit" defaultValue={v.penerbit} error={e.penerbit} />
      </div>

      <div>
        <label htmlFor="category_id" className="mb-1.5 block text-sm font-medium text-slate-700">Kategori</label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={v.category_id ?? ""}
          className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 ${
            e.category_id ? "border-rose-400" : "border-slate-200"
          }`}
        >
          <option value="">-- Pilih kategori --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nama} ({c.kode})
            </option>
          ))}
        </select>
        {e.category_id && <p className="mt-1 text-xs text-rose-600">{e.category_id}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Stok total" name="stok_total" defaultValue={v.stok_total} error={e.stok_total} />
        <FormField label="Durasi maks. pinjam (hari)" name="durasi_maks_pinjam" defaultValue={v.durasi_maks_pinjam ?? "7"} error={e.durasi_maks_pinjam} />
        <FormField label="Denda per hari (Rp)" name="denda_per_hari" defaultValue={v.denda_per_hari ?? "1000"} error={e.denda_per_hari} />
      </div>
      <p className="-mt-2 text-xs text-slate-500">
        {isEdit
          ? "Stok tersedia dihitung otomatis: stok total dikurangi buku yang sedang dipinjam."
          : "Buku baru: semua eksemplar langsung tersedia untuk dipinjam."}
      </p>

      <FormField label="URL cover" name="cover_url" defaultValue={v.cover_url ?? ""} error={e.cover_url} placeholder="https://..." />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : submitLabel}
        </button>
        <Link href="/dashboard/buku" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Batal
        </Link>
      </div>
    </form>
  );
}
