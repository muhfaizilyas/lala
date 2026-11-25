export default function InfoCard({ title, description, children, icon, className = "" }) {
  return (
    <section className={`rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm shadow-slate-200/60 backdrop-blur ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
        </div>
        {icon ? <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-lg">{icon}</div> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
