"use client";

import { useActionState } from "react";
import { deleteUser } from "@/actions/user";

export default function HapusUserButton({ id, nama }) {
  const [state, formAction, pending] = useActionState(deleteUser, { message: "" });

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Hapus user "${nama}"? Riwayat transaksi dan ulasannya ikut terhapus.`)) e.preventDefault();
      }}
      className="inline"
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="text-sm text-red-600 hover:underline disabled:opacity-60">
        {pending ? "..." : "Hapus"}
      </button>
      {state.message && (
        <p role="alert" className="mt-1 max-w-xs text-xs text-red-600">
          {state.message}
        </p>
      )}
    </form>
  );
}
