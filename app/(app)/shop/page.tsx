import { requireAuthUser } from "@/lib/auth/get-user";
import { prisma }          from "@/lib/prisma";
import ShopInterface       from "@/components/shop/ShopInterface";

export const metadata = { title: "Tienda · Solo Leveling" };
export const dynamic  = "force-dynamic";

export default async function ShopPage() {
  const { profile } = await requireAuthUser();

  const [items, hunter] = await Promise.all([
    prisma.item.findMany({
      orderBy: [{ rank: "asc" }, { price: "asc" }],
      include: { owner: { select: { id: true, name: true } } },
    }),
    prisma.user.findUniqueOrThrow({
      where:  { id: profile.id },
      select: { gold: true },
    }),
  ]);

  return (
    <div className="space-y-1 pt-2">
      <div className="mb-4">
        <h1 className="text-lg font-black text-zinc-100">Tienda de Armas</h1>
        <p className="text-xs text-zinc-500">
          Items únicos — solo existe 1 copia de cada uno en el servidor.
        </p>
      </div>

      <ShopInterface
        initialItems={items as any}
        initialGold={hunter.gold}
        userId={profile.id}
      />
    </div>
  );
}
