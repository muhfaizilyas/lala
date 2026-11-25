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
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(15,31,61,0.06)] transition hover:border-blue-300">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {category ? (
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700">
              {category}
            </p>
          ) : null}
          <h3 className="break-words text-base font-bold leading-6 text-[#0f1f3d]">
            {href ? (
              <Link href={href} className="hover:text-blue-700 hover:underline">
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">{summary}</p>
        </div>
        {hideStatus ? null : <StatusBadge status={status} />}
      </div>
      <p className="mt-auto pt-4 text-xs font-medium text-slate-500">{date}</p>
    </article>
  );
}
