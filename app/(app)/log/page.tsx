import { requireAuthUser } from "@/lib/auth/get-user";
import LogInterface from "@/components/log/LogInterface";

export const metadata = { title: "Registrar Actividad · Solo Leveling" };
export const dynamic = "force-dynamic";

export default async function LogPage() {
  const { profile } = await requireAuthUser();
  return <LogInterface userId={profile.id} />;
}
