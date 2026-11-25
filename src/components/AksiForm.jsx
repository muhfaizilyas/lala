"use client";

import { useActionState } from "react";

const GAYA = {
  primary: "bg-sky-600 !text-white hover:bg-sky-700",
  success: "bg-emerald-600 !text-white hover:bg-emerald-700",
  danger: "bg-rose-600 !text-white hover:bg-rose-700",
  dark: "bg-slate-900 !text-white hover:bg-slate-800",
  neutral: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
};

// Tombol aksi generik untuk Server Action berformat (prevState, formData) -> { ok, message }.
// - id           : dikirim sebagai field tersembunyi "id"
// - confirmText  : kalau diisi, tampil confirm() sebelum dikirim
// - alasan       : kalau true, tampil input teks "alasan" yang wajib diisi (mis. tolak)
export default function AksiForm({
  action,
  id,
  label,
  confirmText,
  variant = "primary",
  alasan = false,
  alasanPlaceholder = "Alasan",
  large = false,
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false, message: "" });

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirmText && !confirm(confirmText)) e.preventDefault();
      }}
      className="flex flex-col gap-1"
    >
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap items-center gap-2">
        {alasan ? (
          <input
            name="alasan"
            required
            maxLength={500}
            placeholder={alasanPlaceholder}
            aria-label={alasanPlaceholder}
            className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className={`rounded-xl font-semibold transition disabled:opacity-60 ${
            large ? "px-6 py-3 text-sm" : "px-3 py-1.5 text-xs"
          } ${GAYA[variant] ?? GAYA.primary}`}
        >
          {pending ? "Memproses..." : label}
        </button>
      </div>
      {state.message ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={`max-w-xs text-xs ${state.ok ? "text-emerald-700" : "text-rose-600"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
