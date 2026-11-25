const IKON = {
  book: "M2 4q5-2 10 2 5-4 10-2v15q-5-2-10 2-5-4-10-2zM12 6v15",
  search: "M16.5 10a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0zM15 15l6 6",
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  compass: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM16 8l-2.7 5.3L8 16l2.7-5.3z",
  bell: "M6 17V11a6 6 0 1 1 12 0v6l2 2H4zM10 21h4",
  chart: "M5 21V11M12 21V4M19 21v-8",
  swap: "M4 8h14l-3-3M20 16H6l3 3",
  users: "M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 19v-1a3 3 0 0 0-2.5-3M16.5 4.3a3.5 3.5 0 0 1 0 6.4",
  tag: "M3 12V4h8l10 10-8 8zM7.5 8.5h.01",
  plus: "M12 5v14M5 12h14",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 7v5l3 2",
  edit: "M4 20h4L19 9l-4-4L4 16z",
  login: "M15 4h4v16h-4M10 8l4 4-4 4M14 12H3",
};

export default function Ikon({ nama, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-[18px] w-[18px] shrink-0 fill-none stroke-current ${className}`}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={IKON[nama] ?? IKON.grid} />
    </svg>
  );
}
