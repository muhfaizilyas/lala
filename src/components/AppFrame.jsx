import Link from "next/link";
import Ikon from "@/components/Ikon";
import LogoutButton from "@/components/LogoutButton";
import { dashboardPath } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/navigation";

// Kerangka seluruh halaman: empat menu utama di header yang selalu tampil
// (Beranda, Dashboard, Katalog, Pengumuman), panel kiri yang isinya mengikuti
// menu aktif, lalu isi halaman dan (opsional) panel detail di kanan.
//
// section : "beranda" | "dashboard" | "katalog" | "pengumuman"
// user    : null berarti Guest (menu Dashboard disembunyikan)
// panel   : isi panel kiri (tanpa panel kalau kosong)
// aside   : panel kanan berwarna gelap (dipakai katalog)
// penuh   : isi halaman tanpa padding/lebar tetap (dipakai beranda)
export default function AppFrame({ user = null, section, panel, aside, title, subtitle, actions, penuh = false, children }) {
  const menu = [
    { id: "beranda", href: "/", label: "Beranda", ikon: "home" },
    ...(user ? [{ id: "dashboard", href: dashboardPath(user.role), label: "Dashboard", ikon: "grid" }] : []),
    { id: "katalog", href: "/katalog", label: "Katalog", ikon: "book" },
    { id: "pengumuman", href: "/pengumuman", label: "Pengumuman", ikon: "bell" },
  ];
  const inisial = user
    ? user.nama_lengkap.trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase()
    : "";

  const kolom = panel
    ? aside
      ? "md:grid md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)_minmax(220px,24%)]"
      : "md:grid md:grid-cols-[240px_minmax(0,1fr)]"
    : "";

  return (
    <div className="rb-frame min-h-screen pb-16 md:pb-0">
      <a className="rb-skip" href="#rb-content">Langsung ke konten</a>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white/70 bg-white/80 px-3 shadow-[0_1px_0_rgba(24,35,57,0.05)] backdrop-blur-md sm:px-6 md:h-[78px] md:gap-6">
        {/* Kiri: logo bergradien + nama aplikasi */}
        <Link href="/" aria-label="RakBaca, Perpustakaan Kampus" className="flex shrink-0 items-center gap-3">
          <span className="rb-mark"><Ikon nama="book" /></span><span className="rb-wordmark">RakBaca</span>
        </Link>

        {/* Tengah: empat menu utama */}
        <nav aria-label="Menu utama" className="hidden flex-1 items-center justify-center gap-5 md:flex lg:gap-8">
          {menu.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              aria-current={section === m.id ? "page" : undefined}
              className={`text-sm font-semibold transition-colors ${
                section === m.id ? "text-[#275add]" : "text-[#3b4a63] hover:text-[#0f172a]"
              }`}
            >
              {m.label}
            </Link>
          ))}
        </nav>

        {/* Kanan: avatar, nama + role, tombol keluar */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 md:ml-0">
          {user ? (
            <>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#e4ecff] text-[11px] font-bold text-[#284fac] sm:text-sm">
                {inisial}
              </div>
              <div className="hidden min-w-0 leading-tight lg:block">
                <p className="max-w-40 truncate text-sm font-semibold">{user.nama_lengkap}</p>
                <p className="text-xs text-[#637084]">{ROLE_LABEL[user.role]}</p>
              </div>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-[#f4f5f9]">Masuk</Link>
              <Link href="/register" className="hidden rounded-lg bg-[#275add] px-3 py-2 text-sm font-semibold !text-white hover:bg-[#2453bd] sm:block">Daftar</Link>
            </>
          )}
        </div>
      </header>

      <div className={`flex flex-col ${kolom}`}>
        {panel ? (
          <div className="overflow-x-auto border-b border-[#e5e8ee] bg-white px-3 py-2 md:overflow-visible md:border-b-0 md:border-r md:px-3 md:py-0">
            <div className="md:sticky md:top-[78px] md:max-h-[calc(100vh-78px)] md:overflow-y-auto md:py-6">{panel}</div>
          </div>
        ) : null}

        <main id="rb-content" tabIndex={-1} className={penuh ? "min-w-0" : "min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:px-8"}>
          {title || actions ? (
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                {title ? <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1> : null}
                {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
              </div>
              {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
          ) : null}
          {children}
        </main>

        {aside ? (
          <aside aria-label="Detail buku" id="detail" className="bg-[#11274a] text-white md:col-span-2 lg:col-span-1">
            <div className="px-5 py-5 text-center md:sticky md:top-[78px] md:max-h-[calc(100vh-78px)] md:overflow-y-auto md:py-[30px]">
              {aside}
            </div>
          </aside>
        ) : null}
      </div>

      {/* HP: empat menu utama pindah ke bawah layar */}
      <nav aria-label="Menu utama (HP)" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[#e3e6ed] bg-white md:hidden">
        {menu.map((m) => (
          <Link
            key={m.id}
            href={m.href}
            aria-current={section === m.id ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
              section === m.id ? "font-semibold text-[#275add]" : "text-[#4b5870]"
            }`}
          >
            <Ikon nama={m.ikon} />
            {m.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
