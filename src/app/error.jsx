"use client";

import { useEffect } from "react";
import Link from "next/link";

// Batas error untuk seluruh halaman di bawah root layout (termasuk dashboard).
// Pesan error asli TIDAK ditampilkan ke pengguna supaya detail server tidak bocor;
// pengguna hanya melihat kode `digest` untuk dicocokkan dengan log server.
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div role="alert" className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">Terjadi kesalahan</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Halaman tidak bisa dimuat</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Ada masalah di sisi server. Coba muat ulang; kalau tetap gagal, hubungi admin perpustakaan.
        </p>
        {error?.digest ? (
          <p className="mt-3 text-xs text-slate-400">Kode: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-700"
          >
            Coba lagi
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
