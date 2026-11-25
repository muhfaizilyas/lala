import "../auth.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, dashboardPath } from "@/lib/auth";
import BrandMark from "@/components/BrandMark";
import RegisterForm from "@/components/RegisterForm";

export const metadata = { title: "Daftar" };

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
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 sm:min-h-[calc(100vh-4rem)] xl:grid-cols-[0.95fr_1.05fr]">
        <section className="flex items-center justify-center bg-[#0f1f3d] p-7 text-white sm:p-9 lg:p-12">
          <div className="max-w-md">
            <BrandMark variant="inverse" />
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
              Keanggotaan Mahasiswa
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
              Buat akun untuk mulai menjelajah RakBaca.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
              Daftarkan akun mahasiswa untuk mengakses katalog, mengajukan
              peminjaman, dan memantau transaksi perpustakaan.
            </p>
            <div className="mt-8 space-y-3">
              {notes.map((note) => (
                <div
                  key={note}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-200"
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8 lg:p-12">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Daftar akun
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0f1f3d]">
              Buat profil baru
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Lengkapi data mahasiswa berikut untuk membuat akun RakBaca.
            </p>

            <RegisterForm />

            <p className="mt-6 text-center text-sm text-slate-600">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
              >
                Login di sini
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-slate-600">
              <Link href="/" className="font-semibold text-slate-600 hover:text-[#0f1f3d]">
                Lanjutkan sebagai Guest
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
