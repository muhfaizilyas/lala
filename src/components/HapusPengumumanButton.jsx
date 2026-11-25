"use client";

import { useActionState } from "react";
import { deletePengumuman } from "@/actions/pengumuman";

export default function HapusPengumumanButton({ id, judul }) {
  const [state, formAction, pending] = useActionState(deletePengumuman, { message: "" });

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Hapus pengumuman "${judul}"?`)) e.preventDefault();
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
