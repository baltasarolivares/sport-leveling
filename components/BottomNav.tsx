"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ── SVG helpers ─────────────────────────────────────────────────────────────

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-violet-400" : "text-zinc-500"}`}
      fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2.5 : 1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
    </svg>
  );
}

function ShopIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-amber-400" : "text-zinc-500"}`}
      fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2.5 : 1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 7h11L15 13M9 21a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

function DungeonIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-violet-400" : "text-zinc-500"}`}
      fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2.5 : 1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-violet-400" : "text-zinc-500"}`}
      fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2.5 : 1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

// ── Definición de tabs ───────────────────────────────────────────────────────

const TABS = [
  { href: "/dashboard", label: "Inicio",   Icon: HomeIcon    },
  { href: "/shop",      label: "Tienda",   Icon: ShopIcon    },
  { href: "/log",       label: "Registrar", Icon: null       }, // botón central especial
  { href: "/dungeons",  label: "Dungeons", Icon: DungeonIcon },
  { href: "/profile",   label: "Perfil",   Icon: ProfileIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
      <div className="max-w-2xl mx-auto flex items-center justify-around h-16 px-1">
        {TABS.map(({ href, label, Icon }) => {
          const isLog  = href === "/log";
          const active = pathname === href || pathname.startsWith(`${href}/`);

          if (isLog) {
            return (
              <Link key={href} href={href}
                className="flex flex-col items-center -mt-5">
                <div className="h-12 w-12 rounded-full bg-violet-600 flex items-center justify-center
                  shadow-lg shadow-violet-500/40 border-4 border-zinc-950">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"
                    strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </Link>
            );
          }

          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-0.5 min-w-[48px] py-1">
              {Icon && <Icon active={active} />}
              <span className={`text-[9px] font-medium transition-colors ${
                active
                  ? href === "/shop" ? "text-amber-400" : "text-violet-400"
                  : "text-zinc-600"
              }`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
