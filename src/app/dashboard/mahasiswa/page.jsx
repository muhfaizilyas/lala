import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { formatTanggal, formatRupiah } from "@/lib/format";
import DashboardShell from "@/components/DashboardShell";
import MetricCard from "@/components/MetricCard";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import AksiForm from "@/components/AksiForm";
import { ajukanPerpanjangan } from "@/actions/peminjaman";
import { tandaiSemuaDibaca } from "@/actions/notifikasi";
import { TIPE_NOTIFIKASI } from "@/lib/notifikasi";
import { batalkanReservasi } from "@/actions/reservasi";
import { sapuSemuaAntrean } from "@/lib/reservasi";

export const metadata = { title: "Dashboard Mahasiswa" };

const PESAN = {
  diajukan: "Pengajuan peminjaman terkirim. Tunggu konfirmasi pegawai di meja sirkulasi.",
  ulasan: "Terima kasih, ulasanmu sudah tersimpan.",
  reservasi: "Reservasi dibuat. Kamu akan diberi tahu lewat notifikasi saat bukunya siap diambil.",
};

export default async function MahasiswaDashboardPage({ searchParams }) {
  const user = await requireRole("mahasiswa");
  const { status } = await searchParams;

  // Rapikan antrean reservasi (kedaluwarsa / giliran berikutnya) sebelum menampilkan data.
  await sapuSemuaAntrean();

  const [ringkasan, dipinjam, aktivitas, riwayat, notifikasi, jumlahBaru, reservasi] = await Promise.all([
    pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status_pinjam = 'Sedang Dipinjam')::int      AS dipinjam,
         COUNT(*) FILTER (WHERE status_pinjam = 'Menunggu Konfirmasi')::int  AS menunggu,
         COUNT(*) FILTER (WHERE status_pinjam = 'Selesai')::int              AS selesai,
         COALESCE(SUM(denda_nominal) FILTER (WHERE status_denda = 'Tertunggak'), 0) AS denda,
         COUNT(*) FILTER (WHERE status_pinjam = 'Sedang Dipinjam'
                            AND tanggal_jatuh_tempo < CURRENT_DATE)::int AS telat
       FROM loans WHERE user_id = $1`,
      [user.id]
    ),
    pool.query(
      `SELECT l.id, b.judul, b.pengarang, c.nama AS kategori,
              l.tanggal_jatuh_tempo::text AS jatuh_tempo,
              (l.tanggal_jatuh_tempo - CURRENT_DATE)::int AS sisa_hari,
              l.status_perpanjangan,
              GREATEST(CURRENT_DATE - l.tanggal_jatuh_tempo, 0) * b.denda_per_hari AS estimasi_denda
         FROM loans l
         JOIN books b ON b.id = l.book_id
         JOIN categories c ON c.id = b.category_id
        WHERE l.user_id = $1 AND l.status_pinjam = 'Sedang Dipinjam'
        ORDER BY l.tanggal_jatuh_tempo`,
      [user.id]
    ),
    pool.query(
      `SELECT l.id, b.judul, l.status_pinjam, l.tanggal_pengajuan::date::text AS tanggal
         FROM loans l JOIN books b ON b.id = l.book_id
        WHERE l.user_id = $1
        ORDER BY l.tanggal_pengajuan DESC, l.id DESC
        LIMIT 5`,
      [user.id]
    ),
    pool.query(
      `SELECT l.id, b.judul, l.status_pinjam, l.status_denda, l.denda_nominal,
              l.tanggal_pengajuan::date::text AS diajukan,
              l.tanggal_kembali::text AS kembali,
              l.alasan_penolakan,
              r.id AS review_id
         FROM loans l
         JOIN books b ON b.id = l.book_id
         LEFT JOIN reviews r ON r.loan_id = l.id
        WHERE l.user_id = $1
        ORDER BY l.tanggal_pengajuan DESC, l.id DESC`,
      [user.id]
    ),
    pool.query(
      `SELECT id, tipe, judul, pesan, sudah_dibaca,
              (created_at AT TIME ZONE 'Asia/Jakarta')::date::text AS tanggal,
              to_char(created_at AT TIME ZONE 'Asia/Jakarta', 'HH24:MI') AS jam
         FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT 8`,
      [user.id]
    ),
    pool.query(
      "SELECT COUNT(*)::int AS jumlah FROM notifications WHERE user_id = $1 AND sudah_dibaca = FALSE",
      [user.id]
    ),
    pool.query(
      `SELECT r.id, r.book_id, r.status, b.judul, b.pengarang,
              r.batas_ambil::text AS batas_ambil,
              (SELECT COUNT(*)::int FROM reservations x
                WHERE x.book_id = r.book_id AND x.status = 'Menunggu'
                  AND (x.created_at, x.id) <= (r.created_at, r.id)) AS urutan
         FROM reservations r JOIN books b ON b.id = r.book_id
        WHERE r.user_id = $1 AND r.status IN ('Menunggu', 'Siap Diambil')
        ORDER BY (r.status = 'Siap Diambil') DESC, r.created_at, r.id`,
      [user.id]
    ),
  ]);
  const r = ringkasan.rows[0];
  const belumDibaca = jumlahBaru.rows[0].jumlah;
  const diblokir = Number(r.denda) > 0;

  const stats = [
    { label: "Sedang Dipinjam", value: r.dipinjam, note: "Buku yang kamu pegang", tone: "sky" },
    { label: "Menunggu Konfirmasi", value: r.menunggu, note: "Pengajuan belum diproses", tone: "amber" },
    { label: "Riwayat Selesai", value: r.selesai, note: "Peminjaman yang sudah kembali", tone: "emerald" },
    { label: "Denda Tertunggak", value: formatRupiah(r.denda), note: diblokir ? "Harus dilunasi" : "Tidak ada tanggungan", tone: "rose" },
  ];

  return (
    <DashboardShell
      user={user}
      title="Dashboard Mahasiswa"
      subtitle="Pantau buku yang dipinjam, jatuh tempo, dan denda."
      actions={
        <Link href="/katalog" className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-slate-800">
          Jelajahi Buku
        </Link>
      }
    >
      <div className="space-y-8">
        {Object.hasOwn(PESAN, status) ? (
          <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {PESAN[status]}
          </p>
        ) : null}
        {diblokir ? (
          <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Kamu punya denda tertunggak sebesar <strong>{formatRupiah(r.denda)}</strong>.
            Pengajuan pinjam baru tidak dapat dilakukan sampai denda dilunasi.
          </p>
        ) : null}
        {r.telat > 0 ? (
          <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Kamu masih memegang <strong>{r.telat}</strong> buku yang sudah lewat jatuh tempo.
            Kembalikan ke meja sirkulasi; sampai saat itu pengajuan pinjam dan reservasi baru diblokir.
          </p>
        ) : null}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => <MetricCard key={item.label} {...item} />)}
        </section>

        <section id="notifikasi" className="scroll-mt-20 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                Notifikasi
                {belumDibaca > 0 ? <StatusBadge tone="info">{belumDibaca} baru</StatusBadge> : null}
              </h2>
              <p className="mt-1 text-sm text-slate-500">Kabar terbaru soal pengajuan, pengembalian, dan denda kamu.</p>
            </div>
            {belumDibaca > 0 ? (
              <AksiForm action={tandaiSemuaDibaca} id="semua" label="Tandai semua dibaca" variant="neutral" />
            ) : null}
          </div>
          <div className="mt-5 space-y-3">
            {notifikasi.rows.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Belum ada notifikasi.</p>
            ) : (
              notifikasi.rows.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-2xl px-4 py-3 ${n.sudah_dibaca ? "bg-slate-50" : "border border-sky-200 bg-sky-50"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={TIPE_NOTIFIKASI[n.tipe]?.tone ?? "neutral"}>
                        {TIPE_NOTIFIKASI[n.tipe]?.label ?? "Info"}
                      </StatusBadge>
                      <p className="font-semibold text-slate-900">{n.judul}</p>
                    </div>
                    <p className="text-xs text-slate-500">{formatTanggal(n.tanggal)} · {n.jam} WIB</p>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">{n.pesan}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {reservasi.rows.length > 0 ? (
          <section id="reservasi" className="scroll-mt-20 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Reservasi Saya</h2>
            <p className="mt-1 text-sm text-slate-500">Buku yang kamu antre karena stoknya habis.</p>
            <div className="mt-5 space-y-3">
              {reservasi.rows.map((rv) => (
                <div key={rv.id} className="flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{rv.judul}</p>
                    <p className="text-sm text-slate-500">{rv.pengarang}</p>
                    {rv.status === "Siap Diambil" ? (
                      <p className="mt-1 text-xs font-semibold text-emerald-700">
                        Giliranmu! Ajukan peminjaman sebelum {formatTanggal(rv.batas_ambil)}.
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">Antrean ke-{rv.urutan}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone={rv.status === "Siap Diambil" ? "success" : "warning"}>
                      {rv.status === "Siap Diambil" ? "Siap diambil" : "Menunggu"}
                    </StatusBadge>
                    {rv.status === "Siap Diambil" ? (
                      <Link href={`/buku/${rv.book_id}`} className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold !text-white transition hover:bg-slate-800">
                        Ajukan pinjam
                      </Link>
                    ) : null}
                    <AksiForm action={batalkanReservasi} id={rv.id} label="Batalkan" variant="neutral" confirmText={`Batalkan reservasi "${rv.judul}"?`} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section id="pinjaman" className="grid scroll-mt-20 grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Buku Sedang Dipinjam</h2>
              <p className="mt-1 text-sm text-slate-500">Urut dari jatuh tempo terdekat.</p>
            </div>
            {dipinjam.rows.length === 0 ? (
              <EmptyState
                title="Belum ada buku yang dipinjam"
                description="Cari buku di katalog, lalu ajukan peminjaman."
                action={<Link href="/katalog" className="rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-sky-700">Buka katalog</Link>}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {dipinjam.rows.map((b) => (
                  <article key={b.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">{b.kategori}</p>
                    <h3 className="mt-2 text-base font-bold text-slate-900">{b.judul}</h3>
                    <p className="text-sm text-slate-500">{b.pengarang}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <StatusBadge tone={b.sisa_hari < 0 ? "danger" : b.sisa_hari <= 2 ? "warning" : "info"}>
                        {b.sisa_hari < 0
                          ? `Terlambat ${Math.abs(b.sisa_hari)} hari`
                          : b.sisa_hari === 0
                            ? "Jatuh tempo hari ini"
                            : `${b.sisa_hari} hari lagi`}
                      </StatusBadge>
                      {b.status_perpanjangan ? <StatusBadge status={b.status_perpanjangan} /> : null}
                    </div>
                    <p className="mt-3 text-xs text-slate-500">Jatuh tempo {formatTanggal(b.jatuh_tempo)}</p>
                    {b.sisa_hari < 0 ? (
                      <p className="mt-1 text-xs font-semibold text-rose-600">
                        Estimasi denda berjalan {formatRupiah(b.estimasi_denda)}
                      </p>
                    ) : null}
                    {b.sisa_hari >= 0 && !["Perpanjangan Diajukan", "Perpanjangan Disetujui"].includes(b.status_perpanjangan) ? (
                      <div className="mt-4">
                        <AksiForm action={ajukanPerpanjangan} id={b.id} label="Ajukan Perpanjangan" variant="neutral" />
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Aktivitas Terakhir</h2>
            <p className="mt-1 text-sm text-slate-500">Lima pengajuan terbaru kamu.</p>
            <div className="mt-6 space-y-3">
              {aktivitas.rows.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Belum ada aktivitas.</p>
              ) : (
                aktivitas.rows.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{l.judul}</p>
                      <p className="text-sm text-slate-500">{formatTanggal(l.tanggal)}</p>
                    </div>
                    <StatusBadge status={l.status_pinjam} />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section id="riwayat" className="scroll-mt-20">
          <h2 className="text-xl font-bold text-slate-900">Riwayat Transaksi</h2>
          <p className="mt-1 text-sm text-slate-500">Semua pengajuan, peminjaman, dan denda kamu.</p>
          <div className="mt-4 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Buku</th>
                  <th className="px-5 py-3 font-semibold">Diajukan</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Denda</th>
                  <th className="px-5 py-3 font-semibold">Ulasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riwayat.rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500">Belum ada transaksi.</td>
                  </tr>
                ) : null}
                {riwayat.rows.map((l) => (
                  <tr key={l.id} className="align-top">
                    <td className="px-5 py-4 font-semibold text-slate-900">{l.judul}</td>
                    <td className="px-5 py-4 text-slate-600">{formatTanggal(l.diajukan)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={l.status_pinjam} />
                      {l.status_pinjam === "Ditolak" && l.alasan_penolakan ? (
                        <p className="mt-1 max-w-xs text-xs text-slate-500">Alasan: {l.alasan_penolakan}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      {l.status_denda === "Tidak Ada" ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-medium text-slate-800">{formatRupiah(l.denda_nominal)}</span>
                          <StatusBadge status={l.status_denda} />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {l.status_pinjam !== "Selesai" ? (
                        <span className="text-slate-400">-</span>
                      ) : l.review_id ? (
                        <StatusBadge tone="success">Sudah diulas</StatusBadge>
                      ) : (
                        <Link href={`/dashboard/mahasiswa/ulasan/${l.id}`} className="font-semibold text-sky-600 hover:text-sky-700">
                          Tulis ulasan
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
