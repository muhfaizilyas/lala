import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

/** Mendukung prop item={...} maupun penyebaran properti {...announcement}. */
export default function AnnouncementCard({ item: itemProp, hideStatus = false, href, ...announcementFields }) {
  const item =
    itemProp && typeof itemProp === "object" && !Array.isArray(itemProp)
      ? itemProp
      : announcementFields;

  const title = item.title ?? item.judul ?? "Pengumuman";
  const summary =
    item.summary ??
    item.excerpt ??
    item.ringkasan ??
    item.content ??
    item.isi ??
    "Informasi lebih lanjut belum tersedia.";
  const date = item.date ?? item.tanggal_rilis ?? item.created_at ?? "Tanggal belum tersedia";
  const status = item.status ?? item.publication_status ?? "Published";
  const category = item.category ?? item.kategori;

  return (
    <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {category ? (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
              {category}
            </p>
          ) : null}
          <h3 className="break-words text-sm font-semibold leading-6 text-slate-900">
            {href ? (
              <Link href={href} className="hover:text-blue-700 hover:underline">
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{summary}</p>
        </div>
        {hideStatus ? null : <StatusBadge status={status} />}
      </div>
      <p className="mt-4 text-xs text-slate-500">{date}</p>
    </article>
  );
}
