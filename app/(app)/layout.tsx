import BottomNav from "@/components/BottomNav";
import LogoutButton from "@/components/LogoutButton";
import { getAuthUser } from "@/lib/auth/get-user";
import { CLASS_CONFIG } from "@/types";
import type { HunterClass } from "@/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const authUser = await getAuthUser();
  const classIcon = authUser
    ? CLASS_CONFIG[authUser.profile.hunterClass as HunterClass]?.icon ?? "🌱"
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-13 flex items-center justify-between">
          <span className="text-sm font-black tracking-widest text-zinc-300 uppercase">
            ◈ Solo Leveling
          </span>

          <div className="flex items-center gap-3">
            {authUser && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{classIcon}</span>
                <span className="text-xs font-semibold text-zinc-400 max-w-[120px] truncate">
                  {authUser.profile.name}
                </span>
              </div>
            )}
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Contenido con padding inferior para la bottom nav */}
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-24">
        {children}
      </main>

      {/* Navegación inferior */}
      <BottomNav />
    </div>
  );
}
