import { requireAuthUser } from "@/lib/auth/get-user";
import DungeonInterface from "@/components/dungeons/DungeonInterface";

export const metadata = { title: "Dungeons · Solo Leveling" };
export const dynamic = "force-dynamic";

export default async function DungeonsPage() {
  const { profile } = await requireAuthUser();
  return <DungeonInterface userId={profile.id} />;
}
