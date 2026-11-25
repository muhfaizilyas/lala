import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import PublicShell from "@/components/PublicShell";

export const metadata = { title: "Halaman tidak ditemukan" };

const tombolUtama =
  "rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-700";
const tombolSekunder =
  "rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";

// Tampil untuk URL yang tidak ada dan untuk notFound() di halaman buku / pengumuman.
export default async function NotFound() {
  // Jangan sampai halaman 404 ikut error kalau database sedang bermasalah.
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }

  return (
    <PublicShell user={user}>
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Error 404</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Alamat yang kamu buka tidak ada atau sudah dipindahkan. Periksa kembali alamatnya,
          atau kembali ke halaman utama.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={tombolUtama}>Kembali ke Beranda</Link>
          <Link href="/katalog" className={tombolSekunder}>Lihat Katalog</Link>
        </div>
      </div>
    </PublicShell>
  );
}
