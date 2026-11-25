import Link from "next/link";
import Ikon from "@/components/Ikon";

export default function BrandMark({
  href = "/",
  compact = false,
  className = "",
  variant = "default",
}) {
  const inverse = variant === "inverse";

  return (
    <Link
      href={href}
      aria-label="RakBaca, Perpustakaan Kampus"
      className={`group inline-flex items-center gap-3 ${className}`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition ${
          inverse
            ? "bg-white/15 text-white ring-1 ring-white/25 group-hover:bg-white/25"
            : "bg-[#0f1f3d] text-white group-hover:bg-[#1d4ed8]"
        }`}
      >
        <Ikon nama="book" />
      </span>
      {!compact ? (
        <span className="flex flex-col leading-tight">
          <span
            className={`text-base font-extrabold tracking-tight ${
              inverse ? "text-white" : "text-[#0f1f3d] group-hover:text-[#1d4ed8]"
            }`}
          >
            RakBaca
          </span>
          <span
            className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
              inverse ? "text-blue-200" : "text-slate-500"
            }`}
          >
            Digital Library
          </span>
        </span>
      ) : null}
    </Link>
  );
}
