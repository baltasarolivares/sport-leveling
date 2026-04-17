import { getAllRankings } from "@/lib/data/rankings";
import { getAuthUser } from "@/lib/auth/get-user";
import RankingsTabs from "@/components/rankings/RankingsTabs";

export const metadata = { title: "Rankings · Solo Leveling" };
export const dynamic = "force-dynamic";

export default async function RankingsPage() {
  const authUser = await getAuthUser();
  const data = await getAllRankings(authUser?.profile.id ?? null);

  return (
    <RankingsTabs
      rankings={data}
      totalHunters={data.totalHunters}
      myId={data.myId}
      myPositions={data.myPositions}
    />
  );
}
