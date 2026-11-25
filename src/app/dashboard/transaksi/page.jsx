import { bersihkanKeyword } from "@/lib/pencarian";
import Link from "next/link";
import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { formatTanggal, formatRupiah } from "@/lib/format";
import {
  setujuiPinjam,
  tolakPinjam,
  konfirmasiKembali,
  lunasiDenda,
  setujuiPerpanjangan,
  tolakPerpanjangan,
} from "@/actions/peminjaman";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import AksiForm from "@/components/AksiForm";

export const metadata = { title: "Transaksi Peminjaman" };

// Kondisi WHERE berasal dari konstanta ini (bukan input pengguna), jadi aman.
const TAB = {
  antrean: { label: "Antrean Pinjam", where: "l.status_pinjam = 'Menunggu Konfirmasi'", order: "l.tanggal_pengajuan, l.id" },
  dipinjam: { label: "Sedang Dipinjam", where: "l.status_pinjam = 'Sedang Dipinjam'", order: "l.tanggal_jatuh_tempo, l.id" },
  perpanjangan: {
    label: "Perpanjangan",
    where: "l.status_pinjam = 'Sedang Dipinjam' AND l.status_perpanjangan = 'Perpanjangan Diajukan'",
    order: "l.tanggal_jatuh_tempo, l.id",
  },
  denda: { label: "Denda Tertunggak", where: "l.status_denda = 'Tertunggak'", order: "l.tanggal_kembali, l.id" },
  semua: { label: "Semua Transaksi", where: "TRUE", order: "l.tanggal_pengajuan DESC, l.id DESC" },
};

const input = "min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

function Aksi({ l }) {
  const aksi = [];

  if (l.status_pinjam === "Menunggu Konfirmasi") {
    aksi.push(
      <AksiForm key="ok" action={setujuiPinjam} id={l.id} label="Setujui" variant="success" />,
      <AksiForm key="no" action={tolakPinjam} id={l.id} label="Tolak" variant="danger" alasan alasanPlaceholder="Alasan penolakan" />
    );
  }
  if (l.status_pinjam === "Sedang Dipinjam") {
    if (l.status_perpanjangan === "Perpanjangan Diajukan") {
      aksi.push(
        <AksiForm key="po" action={setujuiPerpanjangan} id={l.id} label="Setujui Perpanjangan" variant="success" />,
        <AksiForm key="pn" action={tolakPerpanjangan} id={l.id} label="Tolak Perpanjangan" variant="neutral" />
      );
    }
    aksi.push(
      <AksiForm
        key="kb"
        action={konfirmasiKembali}
        id={l.id}
        label="Konfirmasi Kembali"
        variant="dark"
        confirmText={`Konfirmasi buku "${l.judul}" sudah dikembalikan?`}
      />
    );
  }
  if (l.status_denda === "Tertunggak") {
    aksi.push(
      <AksiForm
        key="ld"
        action={lunasiDenda}
        id={l.id}
        label="Tandai Lunas"
        variant="primary"
        confirmText={`Tandai denda ${formatRupiah(l.denda_nominal)} sebagai lunas?`}
      />
    );
  }

  if (aksi.length === 0) return <span className="text-xs text-slate-400">-</span>;
  return <div className="flex flex-col items-start gap-2">{aksi}</div>;
}

function Info({ l }) {
  if (l.status_pinjam === "Menunggu Konfirmasi") {
    return <p className="text-slate-600">Diajukan {formatTanggal(l.diajukan)}</p>;
  }
  if (l.status_pinjam === "Ditolak") {
    return <p className="text-slate-600">Alasan: {l.alasan_penolakan}</p>;
  }
  if (l.status_pinjam === "Sedang Dipinjam") {
    return (
      <div className="space-y-1">
        <p className="text-slate-600">Jatuh tempo {formatTanggal(l.jatuh_tempo)}</p>
        {l.hari_telat > 0 ? (
          <p className="text-xs font-semibold text-rose-600">
            Terlambat {l.hari_telat} hari · estimasi denda {formatRupiah(l.estimasi_denda)}
          </p>
        ) : null}
      </div>
    );
  }
  // Selesai
  return (
    <div className="space-y-1">
      <p className="text-slate-600">Kembali {formatTanggal(l.tanggal_kembali)}</p>
      {Number(l.denda_nominal) > 0 ? (
        <p className="text-xs text-slate-500">Denda {formatRupiah(l.denda_nominal)}</p>
      ) : null}
    </div>
  );
}

export default async function TransaksiPage({ searchParams }) {
  const user = await requireRole("admin", "pegawai");
  const { tab: tabParam = "antrean", q = "" } = await searchParams;
  const tab = Object.hasOwn(TAB, tabParam) ? tabParam : "antrean";
  const keyword = bersihkanKeyword(q);
  // Soal: pegawai yang memproses transaksi; admin hanya memantau.
  const bolehAksi = user.role === "pegawai";

  const [daftar, hitung] = await Promise.all([
    pool.query(
      `SELECT l.id, u.nama_lengkap, u.nomor_identitas, b.judul,
              l.status_pinjam, l.status_perpanjangan, l.status_denda,
              l.tanggal_pengajuan::date::text AS diajukan,
              l.tanggal_jatuh_tempo::text AS jatuh_tempo,
              l.tanggal_kembali::text AS tanggal_kembali,
              l.alasan_penolakan, l.denda_nominal,
              CASE WHEN l.status_pinjam = 'Sedang Dipinjam'
                   THEN GREATEST(CURRENT_DATE - l.tanggal_jatuh_tempo, 0)::int
                   ELSE 0 END AS hari_telat,
              CASE WHEN l.status_pinjam = 'Sedang Dipinjam'
                   THEN GREATEST(CURRENT_DATE - l.tanggal_jatuh_tempo, 0) * b.denda_per_hari
                   ELSE 0 END AS estimasi_denda
         FROM loans l
         JOIN users u ON u.id = l.user_id
         JOIN books b ON b.id = l.book_id
        WHERE ${TAB[tab].where}
          AND ($1 = ''
               OR u.nama_lengkap ILIKE '%' || $1 || '%'
               OR u.nomor_identitas ILIKE '%' || $1 || '%'
               OR b.judul ILIKE '%' || $1 || '%')
        ORDER BY ${TAB[tab].order}
        LIMIT 200`,
      [keyword]
    ),
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status_pinjam = 'Menunggu Konfirmasi')::int AS antrean,
        COUNT(*) FILTER (WHERE status_pinjam = 'Sedang Dipinjam')::int AS dipinjam,
        COUNT(*) FILTER (WHERE status_pinjam = 'Sedang Dipinjam'
                           AND status_perpanjangan = 'Perpanjangan Diajukan')::int AS perpanjangan,
        COUNT(*) FILTER (WHERE status_denda = 'Tertunggak')::int AS denda,
        COUNT(*)::int AS semua
      FROM loans`),
  ]);
  const jumlah = hitung.rows[0];
  const rows = daftar.rows;

  return (
    <DashboardShell
      user={user}
      title="Transaksi Peminjaman"
      subtitle={bolehAksi ? "Verifikasi pengajuan, proses pengembalian, perpanjangan, dan denda." : "Pantau seluruh transaksi perpustakaan (hanya lihat)."}
    >
      <div className="space-y-6">
        <nav aria-label="Filter transaksi" className="flex flex-wrap gap-2">
          {Object.entries(TAB).map(([key, t]) => (
            <Link
              key={key}
              href={`/dashboard/transaksi?tab=${key}`}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                key === tab
                  ? "bg-slate-900 !text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {t.label} <span className="ml-1 opacity-70">({jumlah[key]})</span>
            </Link>
          ))}
        </nav>

        <form method="GET" className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <input type="hidden" name="tab" value={tab} />
          <input
            type="search"
            name="q"
            defaultValue={keyword}
            aria-label="Cari nama, NIM, atau judul buku"
            placeholder="Cari nama mahasiswa, NIM, atau judul buku"
            className={input}
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-700">
              Cari
            </button>
            {keyword ? (
              <Link href={`/dashboard/transaksi?tab=${tab}`} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Reset
              </Link>
            ) : null}
          </div>
        </form>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Mahasiswa</th>
                <th className="px-5 py-3 font-semibold">Buku</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Keterangan</th>
                {bolehAksi ? <th className="px-5 py-3 font-semibold">Aksi</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={bolehAksi ? 5 : 4} className="px-5 py-10 text-center text-slate-500">
                    Tidak ada transaksi pada tab ini.
                  </td>
                </tr>
              ) : null}
              {rows.map((l) => (
                <tr key={l.id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{l.nama_lengkap}</p>
                    <p className="font-mono text-xs text-slate-500">{l.nomor_identitas}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{l.judul}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <StatusBadge status={l.status_pinjam} />
                      {l.status_perpanjangan ? <StatusBadge status={l.status_perpanjangan} /> : null}
                      {l.status_denda !== "Tidak Ada" ? <StatusBadge status={l.status_denda} /> : null}
                    </div>
                  </td>
                  <td className="px-5 py-4"><Info l={l} /></td>
                  {bolehAksi ? <td className="px-5 py-4"><Aksi l={l} /></td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 200 ? (
          <p className="text-xs text-slate-500">Menampilkan 200 data teratas. Gunakan pencarian untuk mempersempit.</p>
        ) : null}
      </div>
    </DashboardShell>
  );
}
