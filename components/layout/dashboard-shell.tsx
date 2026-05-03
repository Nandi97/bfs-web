"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type DashboardShellProps = {
  actions: { id: string; title: string }[];
  appointments: {
    id: string;
    locationName: string;
    windowLabel: string;
    note: string;
  }[];
  stores: {
    id: string;
    managerName: string;
    name: string;
    serviceQueueLabel: string;
    stockAlert: string;
    type: string;
  }[];
  transfers: {
    id: string;
    fromName: string;
    sku: string;
    toName: string;
    units: number;
  }[];
};

export function DashboardShell({
  actions,
  appointments,
  stores,
  transfers,
}: DashboardShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col gap-4 p-4 md:px-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-700/80 dark:text-emerald-300/75">
              Live workspace
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Operations</h1>
            <p className="text-sm text-muted-foreground">
              Thursday view across corporate stores, franchise stores, and service appointments.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
            <Card className="gap-0 py-0">
              <CardHeader className="border-b px-4 py-3">
                <CardTitle className="text-sm font-medium">Store status</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/40 text-left text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Store</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Manager</th>
                        <th className="px-4 py-3 font-medium">Service queue</th>
                        <th className="px-4 py-3 font-medium">Inventory</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stores.map((row) => (
                        <tr key={row.id} className="border-t align-top hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{row.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.type}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.managerName}</td>
                          <td className="px-4 py-3">{row.serviceQueueLabel}</td>
                          <td className="px-4 py-3">{row.stockAlert}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="gap-0 py-0">
              <CardHeader className="border-b px-4 py-3">
                <CardTitle className="text-sm font-medium">Today&apos;s actions</CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-3">
                <ul className="space-y-3 text-sm">
                  {actions.map((action) => (
                    <li key={action.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                      {action.title}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="gap-0 py-0">
              <CardHeader className="border-b px-4 py-3">
                <CardTitle className="text-sm font-medium">Service bookings</CardTitle>
              </CardHeader>
              <CardContent className="divide-y px-0">
                {appointments.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-2 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)]"
                  >
                    <div className="text-sm font-medium">{item.locationName}</div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">{item.windowLabel}</div>
                      <div className="text-sm">{item.note}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="gap-0 py-0">
              <CardHeader className="border-b px-4 py-3">
                <CardTitle className="text-sm font-medium">Stock transfers</CardTitle>
              </CardHeader>
              <CardContent className="divide-y px-0">
                {transfers.map((move) => (
                  <div
                    key={move.id}
                    className="flex items-start justify-between gap-4 px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{move.sku}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {move.fromName} to {move.toName}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm">{move.units} units</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Operational notes</CardTitle>
                <CardDescription>
                  Shared starter shell, business-specific content.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 text-sm font-medium">Retail floor</div>
                  <p className="text-sm text-muted-foreground">
                    Tester counts are stable except Union Square, where the serum wall needs a midday refill.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="mb-2 text-sm font-medium">Service delivery</div>
                  <p className="text-sm text-muted-foreground">
                    Booking load is even across the afternoon, with one risk window at North Hill if walk-ins exceed forecast.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="mb-2 text-sm font-medium">Staff coverage</div>
                  <p className="text-sm text-muted-foreground">
                    Franchise coverage is complete. Corporate stores still need one backup closer confirmed for Saturday.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
