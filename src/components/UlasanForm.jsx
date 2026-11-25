"use client";

import { useActionState } from "react";
import { kirimUlasan } from "@/actions/peminjaman";

export default function UlasanForm({ loanId }) {
  const [state, formAction, pending] = useActionState(kirimUlasan, {
    errors: {},
    message: "",
    values: {},
  });
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="loan_id" value={loanId} />

      {state.message ? (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {state.message}
        </p>
      ) : null}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">Rating</legend>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={n}
                defaultChecked={String(state.values?.rating) === String(n)}
                className="peer sr-only"
              />
              <span className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition peer-checked:border-amber-400 peer-checked:bg-amber-50 peer-checked:text-amber-700 peer-focus-visible:ring-4 peer-focus-visible:ring-amber-100">
                {n} ★
              </span>
            </label>
          ))}
        </div>
        {errors.rating ? <p className="mt-1.5 text-xs text-rose-600">{errors.rating}</p> : null}
      </fieldset>

      <div>
        <label htmlFor="komentar" className="mb-1.5 block text-sm font-medium text-slate-700">
          Komentar (opsional)
        </label>
        <textarea
          id="komentar"
          name="komentar"
          rows={4}
          maxLength={1000}
          defaultValue={state.values?.komentar ?? ""}
          placeholder="Ceritakan pendapatmu tentang buku ini..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
        {errors.komentar ? <p className="mt-1.5 text-xs text-rose-600">{errors.komentar}</p> : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Mengirim..." : "Kirim Ulasan"}
      </button>
    </form>
  );
}
