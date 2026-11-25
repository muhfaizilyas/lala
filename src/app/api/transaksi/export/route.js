import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { buatCsv } from "@/lib/csv";

// Selalu dihitung ulang, tidak boleh di-cache (data berubah dan khusus admin).
export const dynamic = "force-dynamic";

// GET /api/transaksi/export            -> CSV dengan pemisah koma
// GET /api/transaksi/export?pemisah=titik-koma -> pemisah ; (Excel dengan setelan regional Indonesia)
// Hanya admin. Berisi seluruh transaksi + rekap denda di bagian bawah.
export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Belum login." }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ message: "Hanya admin yang boleh mengekspor." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const pemisah = searchParams.get("pemisah") === "titik-koma" ? ";" : ",";

  try {
    const [transaksi, rekap] = await Promise.all([
      pool.query(
        `SELECT l.id, u.nama_lengkap, u.nomor_identitas, u.email,
                b.judul, b.isbn,
                l.status_pinjam, l.status_perpanjangan,
                l.tanggal_pengajuan::date::text AS tanggal_pengajuan,
                l.tanggal_pinjam::text          AS tanggal_pinjam,
                l.tanggal_jatuh_tempo::text     AS tanggal_jatuh_tempo,
                l.tanggal_kembali::text         AS tanggal_kembali,
                l.alasan_penolakan,
                l.denda_nominal::float          AS denda_nominal,
                l.status_denda,
                l.tanggal_denda_lunas::text     AS tanggal_denda_lunas,
                p.nama_lengkap                  AS diproses_oleh
           FROM loans l
           JOIN users u ON u.id = l.user_id
           JOIN books b ON b.id = l.book_id
           LEFT JOIN users p ON p.id = l.processed_by
          ORDER BY l.tanggal_pengajuan DESC, l.id DESC`
      ),
      pool.query(
        `SELECT COUNT(*)::int AS total_transaksi,
                COUNT(*) FILTER (WHERE denda_nominal > 0)::int AS transaksi_berdenda,
                COALESCE(SUM(denda_nominal), 0)::float AS total_denda,
                COALESCE(SUM(denda_nominal) FILTER (WHERE status_denda = 'Tertunggak'), 0)::float AS denda_tertunggak,
                COALESCE(SUM(denda_nominal) FILTER (WHERE status_denda = 'Lunas'), 0)::float AS denda_lunas
           FROM loans`
      ),
    ]);
    const r = rekap.rows[0];

    const baris = [
      [
        "ID", "Nama Mahasiswa", "NIM", "Email", "Judul Buku", "ISBN",
        "Status Pinjam", "Status Perpanjangan", "Tanggal Pengajuan", "Tanggal Pinjam",
        "Jatuh Tempo", "Tanggal Kembali", "Alasan Penolakan", "Denda (Rp)",
        "Status Denda", "Tanggal Denda Lunas", "Diproses Oleh",
      ],
      ...transaksi.rows.map((t) => [
        t.id, t.nama_lengkap, t.nomor_identitas, t.email, t.judul, t.isbn,
        t.status_pinjam, t.status_perpanjangan, t.tanggal_pengajuan, t.tanggal_pinjam,
        t.tanggal_jatuh_tempo, t.tanggal_kembali, t.alasan_penolakan, t.denda_nominal,
        t.status_denda, t.tanggal_denda_lunas, t.diproses_oleh,
      ]),
      [],
      ["REKAP DENDA"],
      ["Total transaksi", r.total_transaksi],
      ["Transaksi berdenda", r.transaksi_berdenda],
      ["Total denda (Rp)", r.total_denda],
      ["Denda tertunggak (Rp)", r.denda_tertunggak],
      ["Denda lunas (Rp)", r.denda_lunas],
    ];

    const tanggal = new Date().toISOString().slice(0, 10);
    return new NextResponse(buatCsv(baris, pemisah), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="transaksi-perpustakaan-${tanggal}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
