import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function Home() {
  const data = await getDashboardData();

  return <DashboardShell {...data} />;
}
