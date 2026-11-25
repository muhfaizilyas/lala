import Link from 'next/link';
import BookCover from '@/components/BookCover';
import StatusBadge from '@/components/StatusBadge';

/** Mendukung dua pola: <BookCard book={book} /> dan <BookCard {...book} />. */
export default function BookCard({ book: bookProp, badge, ...bookFields }) {
  const book = bookProp && typeof bookProp === 'object' && !Array.isArray(bookProp) ? bookProp : bookFields;
  const title = book.title ?? book.judul ?? 'Judul Buku';
  const author = book.author ?? book.penulis ?? book.pengarang ?? 'Penulis belum tersedia';
  const category = book.category ?? book.kategori ?? 'Tanpa kategori';
  const stock = book.stock ?? book.stok_tersedia ?? book.stok_total ?? '—';
  const status = badge ?? book.status ?? (Number(stock) > 0 ? 'Tersedia' : 'Stok habis');
  const href = typeof book.href === 'string' && book.href ? book.href : null;
  const coverId = book.id ?? Array.from(title).reduce((sum,c) => sum+c.charCodeAt(0),0);
  return <article className="rb-card"><div className="rb-shelf"><BookCover src={book.cover_url ?? book.cover} judul={title} id={coverId} className="rb-cover" /></div><div className="rb-card-info"><p className="rb-category">{category}</p><h3>{href ? <Link href={href}>{title}</Link> : title}</h3><p>{author}</p><div className="rb-availability"><StatusBadge status={status} /><span>Stok: {stock}</span></div>{book.rating != null && <small>Rating: {book.rating} / 5</small>}</div></article>;
}
