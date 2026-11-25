const tones = {
  blue: "from-blue-600 to-cyan-500",
  sky: "from-sky-600 to-cyan-500",
  emerald: "from-emerald-600 to-teal-500",
  amber: "from-amber-500 to-orange-500",
  rose: "from-rose-600 to-pink-500",
  violet: "from-violet-600 to-fuchsia-500",
};

export default function MetricCard({ label, value, description, note, tone = "blue" }) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm shadow-slate-200/60 backdrop-blur">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tones[tone] ?? tones.blue}`} />
      <p className="text-sm font-medium text-slate-500">{label ?? "Statistik"}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value ?? "—"}</p>
      {(description ?? note) ? (
        <p className="mt-2 text-sm text-slate-600">{description ?? note}</p>
      ) : null}
    </article>
  );
}
