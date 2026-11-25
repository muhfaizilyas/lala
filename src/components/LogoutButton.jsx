import { logoutAction } from "@/actions/auth";

// Server Component: form biasa yang memanggil Server Action, tanpa "use client".
export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#0f1f3d]"
      >
        Keluar
      </button>
    </form>
  );
}
