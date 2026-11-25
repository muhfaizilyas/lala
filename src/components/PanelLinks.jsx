"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Ikon from "@/components/Ikon";

// Daftar tautan panel kiri. grup = [{ judul, items: [{ href, label, ikon, badge, aktif }] }].
// item.aktif diisi eksplisit untuk tautan berparameter (?kategori=..).
// Kalau tidak diisi, item yang href-nya paling cocok dengan alamat halaman
// saat ini (cocok terpanjang) ditandai aktif.
export default function PanelLinks({ grup, label }) {
  const pathname = usePathname();

  const kandidat = grup
    .flatMap((g) => g.items)
    .filter(
      (i) =>
        i.aktif === undefined &&
        !i.href.includes("?") &&
        !i.href.includes("#") &&
        (pathname === i.href || pathname.startsWith(`${i.href}/`))
    )
    .sort((a, b) => b.href.length - a.href.length);
  const terbaik = kandidat[0] ?? null;

  return (
    <nav aria-label={label} className="flex gap-3 md:block">
      {grup.map((g, gi) => (
        <div key={gi} className="flex shrink-0 gap-2 md:mb-6 md:block">
          {g.judul ? (
            <p className="mb-2 hidden px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 md:block">
              {g.judul}
            </p>
          ) : null}
          {g.items.map((item) => {
            const aktif = item.aktif !== undefined ? item.aktif : item === terbaik;
            return (
              <Link
                key={item.href}
                href={item.href}
                scroll={item.tetapScroll ? false : undefined}
                aria-current={aktif ? "page" : undefined}
                className={`flex min-h-[40px] items-center gap-2.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs transition md:mb-1 md:w-full md:whitespace-normal md:rounded-lg md:border-0 md:px-3 md:py-2.5 md:text-[13px] ${
                  aktif
                    ? "border-blue-200 bg-blue-50 font-semibold text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-[#0f1f3d] md:bg-transparent"
                }`}
              >
                {item.ikon ? <Ikon nama={item.ikon} className="hidden md:block" /> : null}
                <span className="min-w-0 flex-1 md:leading-snug">{item.label}</span>
                {item.badge !== undefined ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      aktif ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
