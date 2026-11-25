import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import { parseId } from "@/lib/parseId";
import { requireRole } from "@/lib/auth";
import { formatTanggal } from "@/lib/format";
import DashboardShell from "@/components/DashboardShell";
import UlasanForm from "@/components/UlasanForm";

export const metadata = { title: "Tulis Ulasan" };

export default async function UlasanPage({ params }) {
  const user = await requireRole("mahasiswa");
  const { id } = await params;
  const loanId = parseId(id);
  if (!loanId) notFound();

  const { rows } = await pool.query(
    `SELECT l.id, l.status_pinjam, l.tanggal_kembali::text AS kembali,
            b.id AS book_id, b.judul, b.pengarang,
            EXISTS (SELECT 1 FROM reviews r WHERE r.loan_id = l.id) AS sudah
       FROM loans l JOIN books b ON b.id = l.book_id
      WHERE l.id = $1 AND l.user_id = $2`,
    [loanId, user.id]
  );
  const loan = rows[0];
  if (!loan) notFound();
  // Ulasan hanya untuk transaksi Selesai dan hanya satu kali
  if (loan.status_pinjam !== "Selesai" || loan.sudah) redirect("/dashboard/mahasiswa");

  return (
    <DashboardShell user={user} title="Tulis Ulasan" subtitle="Bagikan pengalamanmu setelah membaca buku ini.">
      <div className="mx-auto max-w-xl space-y-6">
        <Link href="/dashboard/mahasiswa" className="text-sm font-semibold text-sky-600 hover:text-sky-700">
          &larr; Kembali ke dashboard
        </Link>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Buku</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">{loan.judul}</h2>
          <p className="text-sm text-slate-500">
            {loan.pengarang} · dikembalikan {formatTanggal(loan.kembali)}
          </p>
          <div className="mt-6">
            <UlasanForm loanId={loan.id} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
