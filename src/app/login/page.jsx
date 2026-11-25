import "../auth.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import LoginForm from "@/components/LoginForm";
import { getCurrentUser, dashboardPath } from "@/lib/auth";

export const metadata = { title: "Masuk" };

const features = [
  ["Katalog online", "Cari buku dan cek ketersediaan stok kapan saja."],
  ["Peminjaman terpantau", "Lihat jatuh tempo, perpanjangan, dan denda di satu tempat."],
  ["Satu akun, tiga peran", "Mahasiswa, pegawai, dan admin punya dashboard sendiri."],
];

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(dashboardPath(user.role)); // sudah login

  return (
    <div className="rb-auth min-h-screen px-4 py-8 text-slate-800 md:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-2xl shadow-slate-900/5 backdrop-blur xl:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between bg-slate-950 p-8 text-white md:p-10 lg:p-12">
          <div>
            <BrandMark variant="inverse" />
            <p className="mt-8 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
              Sistem Manajemen Perpustakaan
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight md:text-5xl">
              Masuk ke RakBaca.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
              Pinjam buku, pantau jatuh tempo, dan kelola perpustakaan kampus dari satu tempat.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {features.map(([title, desc]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-6 md:p-10 lg:p-12">
          <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Selamat datang</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Login ke akunmu</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Masukkan email dan password untuk membuka dashboard.
            </p>

            <LoginForm />

            <div className="mt-6 space-y-2 text-center text-sm text-slate-500">
              <p>
                Belum punya akun?{" "}
                <Link href="/register" className="font-semibold text-sky-600 hover:text-sky-700">
                  Daftar sekarang
                </Link>
              </p>
              <p>
                <Link href="/" className="font-semibold text-slate-600 hover:text-slate-900">
                  Lanjutkan sebagai Guest
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
