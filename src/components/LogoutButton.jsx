import { logoutAction } from "@/actions/auth";

// Server Component: form biasa yang memanggil Server Action, tanpa "use client".
export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Keluar
      </button>
    </form>
  );
}
