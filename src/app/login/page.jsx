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
    <main className="rb-auth min-h-screen px-4 py-8 text-slate-800 md:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between bg-[#0f1f3d] p-8 text-white md:p-10 lg:p-12">
          <div>
            <BrandMark variant="inverse" />
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
              Sistem Manajemen Perpustakaan
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-extrabold tracking-tight md:text-5xl">
              Masuk ke RakBaca.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
              Pinjam buku, pantau jatuh tempo, dan kelola perpustakaan kampus dari satu tempat.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {features.map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-6 md:p-10 lg:p-12">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Selamat datang</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0f1f3d]">Login ke akunmu</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Masukkan email dan password untuk membuka dashboard.
            </p>

            <LoginForm />

            <div className="mt-6 space-y-2 text-center text-sm text-slate-600">
              <p>
                Belum punya akun?{" "}
                <Link href="/register" className="font-semibold text-blue-700 hover:text-blue-800 hover:underline">
                  Daftar sekarang
                </Link>
              </p>
              <p>
                <Link href="/" className="font-semibold text-slate-600 hover:text-[#0f1f3d]">
                  Lanjutkan sebagai Guest
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
