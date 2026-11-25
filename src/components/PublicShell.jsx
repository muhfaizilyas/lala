import Link from "next/link";
import AppFrame from "@/components/AppFrame";
import Ikon from "@/components/Ikon";

// Beranda: header dengan menu utama tanpa panel kiri, ditutup footer navy informatif.
export default function PublicShell({ children, user = null }) {
  return (
    <AppFrame user={user} section="beranda" penuh>
      {children}
      <footer className="mt-16 bg-[#0f1f3d] text-slate-200">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
                <Ikon nama="book" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">RakBaca</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Sistem informasi perpustakaan kampus untuk mencari koleksi, mengajukan peminjaman, memantau antrean reservasi, dan mengecek status pengembalian.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">Navigasi</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/katalog" className="text-slate-200 transition hover:text-white">Katalog Buku</Link></li>
              <li><Link href="/pengumuman" className="text-slate-200 transition hover:text-white">Pengumuman</Link></li>
              {user ? (
                <li><Link href="/dashboard" className="text-slate-200 transition hover:text-white">Dashboard Akun</Link></li>
              ) : (
                <>
                  <li><Link href="/login" className="text-slate-200 transition hover:text-white">Masuk Anggota</Link></li>
                  <li><Link href="/register" className="text-slate-200 transition hover:text-white">Daftar Mahasiswa</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">Layanan Sirkulasi</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Pengajuan pinjam dan reservasi diproses secara daring sebelum pengambilan buku di meja sirkulasi perpustakaan kampus.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} RakBaca. Perpustakaan Kampus.</p>
            <p>Akses katalog, pengajuan, dan riwayat peminjaman mahasiswa.</p>
          </div>
        </div>
      </footer>
    </AppFrame>
  );
}
