import "../auth.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, dashboardPath } from "@/lib/auth";
import BrandMark from "@/components/BrandMark";
import RegisterForm from "@/components/RegisterForm";

const notes = [
  "Pendaftaran dibuka khusus untuk mahasiswa.",
  "Gunakan email kampus dan NIM yang valid.",
  "Peran akun Mahasiswa ditetapkan otomatis oleh sistem.",
];

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(dashboardPath(user.role)); // sudah login

  return (
    <main className="rb-auth min-h-screen px-4 py-6 text-slate-800 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/5 sm:min-h-[calc(100vh-4rem)] xl:grid-cols-[0.95fr_1.05fr]">
        <section className="flex items-center justify-center bg-gradient-to-br from-sky-600 via-indigo-600 to-slate-950 p-7 text-white sm:p-9 lg:p-12">
          <div className="max-w-md">
            <BrandMark variant="inverse" />
            <h1 className="mt-8 text-4xl font-black tracking-tight md:text-5xl">
              Buat akun untuk mulai menjelajah RakBaca.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-200 md:text-base">
              Daftarkan akun mahasiswa untuk mengakses katalog, mengajukan
              peminjaman, dan memantau transaksi perpustakaan.
            </p>
            <div className="mt-8 space-y-3">
              {notes.map((note) => (
                <div
                  key={note}
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm leading-6 text-slate-100 backdrop-blur"
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8 lg:p-12">
          <div className="w-full max-w-xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
              Daftar akun
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Buat profil baru
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Lengkapi data mahasiswa berikut untuk membuat akun RakBaca.
            </p>

            <RegisterForm />

            <p className="mt-6 text-center text-sm text-slate-500">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-sky-700 hover:text-sky-800"
              >
                Login di sini
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-slate-500">
              <Link href="/" className="font-semibold text-slate-600 hover:text-slate-900">
                Lanjutkan sebagai Guest
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
