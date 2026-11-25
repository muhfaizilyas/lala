const toneClasses = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
  error: "bg-rose-50 text-rose-700 ring-rose-200",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  default: "bg-slate-100 text-slate-700 ring-slate-200",
};

const statusClasses = {
  aktif: toneClasses.success,
  tersedia: toneClasses.success,
  published: toneClasses.success,
  disetujui: toneClasses.success,
  selesai: toneClasses.success,
  dipinjam: toneClasses.info,
  "menunggu konfirmasi": toneClasses.warning,
  menunggu: toneClasses.warning,
  tertunda: toneClasses.warning,
  draft: toneClasses.neutral,
  ditolak: toneClasses.danger,
  "sedang dipinjam": toneClasses.info,
  "perpanjangan diajukan": toneClasses.warning,
  "perpanjangan disetujui": toneClasses.success,
  "perpanjangan ditolak": toneClasses.danger,
  tertunggak: toneClasses.danger,
  lunas: toneClasses.success,
  terlambat: toneClasses.danger,
  "stok habis": toneClasses.danger,
};

/** Mendukung pola lama status="Aktif" dan pola tone="success" dengan children. */
export default function StatusBadge({ status, tone, children, className = "" }) {
  const label = status ?? children ?? "Status";
  const key = typeof label === "string" ? label.trim().toLowerCase() : "";
  const appearance = toneClasses[tone] ?? statusClasses[key] ?? toneClasses.neutral;

  return (
    <span
      className={`inline-flex max-w-full items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ${appearance} ${className}`}
    >
      {label}
    </span>
  );
}
