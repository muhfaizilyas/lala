import Link from "next/link";

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
      aria-label="RakBaca - Perpustakaan Kampus"
      className={`group inline-flex items-center gap-3 ${className}`}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-lg font-black text-white shadow-lg shadow-blue-500/25">
        R
      </span>
      {!compact ? (
        <span className="flex flex-col leading-tight">
          <span
            className={`text-sm font-semibold uppercase tracking-[0.24em] ${
              inverse ? "text-slate-300" : "text-slate-500"
            }`}
          >
            RakBaca
          </span>
          <span
            className={`text-sm font-semibold ${
              inverse
                ? "text-white group-hover:text-sky-200"
                : "text-slate-900 group-hover:text-blue-700"
            }`}
          >
            Perpustakaan Kampus
          </span>
        </span>
      ) : null}
    </Link>
  );
}
