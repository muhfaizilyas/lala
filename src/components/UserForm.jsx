"use client";

import { useActionState } from "react";
import Link from "next/link";
import FormField from "@/components/FormField";
import { ROLE_USER } from "@/lib/validation";
import { ROLE_LABEL } from "@/lib/navigation";

const kontrol =
  "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

// mode "baru": ada NIM + password. mode "edit": NIM hanya tampil, ada status akun.
// isSelf: admin sedang mengedit akunnya sendiri -> role & status dikunci.
export default function UserForm({ action, mode = "baru", initial = {}, isSelf = false, submitLabel }) {
  const [state, formAction, pending] = useActionState(action, {
    errors: {},
    message: "",
    values: initial,
  });
  const v = state.values;
  const e = state.errors;
  const edit = mode === "edit";

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message}
        </p>
      )}

      <FormField label="Nama lengkap" name="nama_lengkap" defaultValue={v.nama_lengkap} error={e.nama_lengkap} />
      <FormField label="Email" name="email" type="email" autoComplete="off" defaultValue={v.email} error={e.email} />

      {edit ? (
        <div>
          <label htmlFor="nomor_identitas_tampil" className="mb-1.5 block text-sm font-medium text-slate-700">
            Nomor identitas (NIM / NIP)
          </label>
          <input id="nomor_identitas_tampil" value={initial.nomor_identitas ?? ""} disabled readOnly className={`${kontrol} border-slate-200`} />
          <p className="mt-1.5 text-xs text-slate-500">Nomor identitas tidak dapat diubah.</p>
        </div>
      ) : (
        <FormField label="Nomor identitas (NIM / NIP)" name="nomor_identitas" defaultValue={v.nomor_identitas} error={e.nomor_identitas} />
      )}

      {!edit ? (
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          error={e.password}
          helperText="Minimal 8 karakter. Disimpan sebagai hash, bukan teks asli."
        />
      ) : (
        <FormField
          label="Password baru (opsional)"
          name="password"
          type="password"
          autoComplete="new-password"
          error={e.password}
          helperText="Kosongkan jika tidak ingin mengubah password. Jika diisi (8-72 karakter), user ini keluar dari semua perangkat."
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
          <select
            id="role"
            name="role"
            defaultValue={v.role ?? ""}
            disabled={isSelf}
            className={`${kontrol} ${e.role ? "border-rose-400" : "border-slate-200"}`}
          >
            <option value="">Pilih role</option>
            {ROLE_USER.map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </select>
          {e.role && <p className="mt-1.5 text-xs text-rose-600">{e.role}</p>}
        </div>

        {edit && (
          <div>
            <label htmlFor="is_active" className="mb-1.5 block text-sm font-medium text-slate-700">Status akun</label>
            <select
              id="is_active"
              name="is_active"
              defaultValue={v.is_active ?? "true"}
              disabled={isSelf}
              className={`${kontrol} ${e.is_active ? "border-rose-400" : "border-slate-200"}`}
            >
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
            {e.is_active && <p className="mt-1.5 text-xs text-rose-600">{e.is_active}</p>}
          </div>
        )}
      </div>
      {isSelf && (
        <p className="text-xs text-slate-500">
          Ini akunmu sendiri, jadi role dan status tidak bisa diubah agar kamu tidak terkunci dari sistem.
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : submitLabel}
        </button>
        <Link
          href="/dashboard/admin/user"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
