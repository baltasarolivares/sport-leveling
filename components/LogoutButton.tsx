"use client";

import { logout } from "@/lib/auth/actions";
import { useTransition } from "react";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logout();
    });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600
        hover:text-zinc-400 transition-colors disabled:opacity-40"
    >
      {isPending ? "Saliendo…" : "Salir"}
    </button>
  );
}
