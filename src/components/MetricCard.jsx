const tones = {
  blue: "bg-blue-600",
  sky: "bg-blue-600",
  navy: "bg-[#0f1f3d]",
  emerald: "bg-emerald-600",
  amber: "bg-amber-500",
  rose: "bg-rose-600",
  violet: "bg-[#0f1f3d]",
};

export default function MetricCard({ label, value, description, note, tone = "blue" }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(15,31,61,0.06)]">
      <div className={`absolute inset-x-0 top-0 h-1 ${tones[tone] ?? tones.blue}`} />
      <p className="text-sm font-medium text-slate-600">{label ?? "Statistik"}</p>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#0f1f3d]">{value ?? "-"}</p>
      {(description ?? note) ? (
        <p className="mt-2 text-sm text-slate-600">{description ?? note}</p>
      ) : null}
    </article>
  );
}
