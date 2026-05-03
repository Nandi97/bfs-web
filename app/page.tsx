import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireSession } from "@/lib/auth-guard";
import { getDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  await requireSession();
  const data = await getDashboardData();

  return <DashboardShell {...data} />;
}
