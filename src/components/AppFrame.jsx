import Link from "next/link";
import Ikon from "@/components/Ikon";
import LogoutButton from "@/components/LogoutButton";
import { dashboardPath } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/navigation";

// Kerangka seluruh halaman: menu utama di header yang selalu tampil
// (Beranda, Dashboard, Katalog, Pengumuman), panel kiri yang isinya mengikuti
// menu aktif, lalu isi halaman dan (opsional) panel detail di kanan.
//
// section : "beranda" | "dashboard" | "katalog" | "pengumuman"
// user    : null berarti Guest (menu Dashboard disembunyikan)
// panel   : isi panel kiri (tanpa panel kalau kosong)
// aside   : panel kanan berwarna navy gelap (dipakai katalog)
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
      ? "md:grid md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)_minmax(240px,25%)]"
      : "md:grid md:grid-cols-[240px_minmax(0,1fr)]"
    : "";

  return (
    <div className="rb-frame min-h-screen pb-16 md:pb-0">
      <a className="rb-skip" href="#rb-content">Langsung ke konten</a>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-3 backdrop-blur-sm sm:px-6 md:h-[74px] md:gap-6">
        <Link href="/" aria-label="RakBaca, Perpustakaan Kampus" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0f1f3d] text-white">
            <Ikon nama="book" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="rb-wordmark">RakBaca</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:block">
              Perpustakaan Kampus
            </span>
          </span>
        </Link>

        <nav aria-label="Menu utama" className="hidden flex-1 items-center justify-center gap-2 md:flex lg:gap-4">
          {menu.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              aria-current={section === m.id ? "page" : undefined}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                section === m.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#0f1f3d]"
              }`}
            >
              {m.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 md:ml-0">
          {user ? (
            <>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700 ring-1 ring-blue-200 sm:text-sm">
                {inisial}
              </div>
              <div className="hidden min-w-0 leading-tight lg:block">
                <p className="max-w-40 truncate text-sm font-semibold text-slate-900">{user.nama_lengkap}</p>
                <p className="text-xs text-slate-500">{ROLE_LABEL[user.role]}</p>
              </div>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex min-h-[40px] items-center rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#0f1f3d]"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="hidden min-h-[40px] items-center rounded-lg bg-[#0f1f3d] px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[#172d54] sm:inline-flex"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </header>

      <div className={`flex flex-col ${kolom}`}>
        {panel ? (
          <div className="overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:overflow-visible md:border-b-0 md:border-r md:px-3 md:py-0">
            <div className="md:sticky md:top-[74px] md:max-h-[calc(100vh-74px)] md:overflow-y-auto md:py-6">{panel}</div>
          </div>
        ) : null}

        <main id="rb-content" tabIndex={-1} className={penuh ? "min-w-0" : "min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:px-8"}>
          {title || actions ? (
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                {title ? <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1> : null}
                {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
              </div>
              {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
          ) : null}
          {children}
        </main>

        {aside ? (
          <aside aria-label="Detail buku" id="detail" className="bg-[#0f1f3d] text-white md:col-span-2 lg:col-span-1">
            <div className="px-5 py-5 text-center md:sticky md:top-[74px] md:max-h-[calc(100vh-74px)] md:overflow-y-auto md:py-[30px]">
              {aside}
            </div>
          </aside>
        ) : null}
      </div>

      <nav aria-label="Menu utama (HP)" className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white md:hidden">
        {menu.map((m) => (
          <Link
            key={m.id}
            href={m.href}
            aria-current={section === m.id ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
              section === m.id ? "font-semibold text-blue-700" : "text-slate-600"
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
