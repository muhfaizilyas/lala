export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center">
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
