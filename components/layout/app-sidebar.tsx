"use client";

import * as React from "react";
import { BriefcaseBusiness, Building2, CalendarRange, ChevronRight, Users } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";

const navItems = [
  {
    title: "Dashboard",
    icon: Building2,
    isActive: true,
    items: [],
  },
  {
    title: "Operations",
    icon: BriefcaseBusiness,
    isActive: true,
    items: [
      { title: "Retail" },
      { title: "Services" },
      { title: "Inventory" },
    ],
  },
  {
    title: "Planning",
    icon: CalendarRange,
    isActive: false,
    items: [{ title: "Staffing" }, { title: "Promotions" }],
  },
  {
    title: "Team",
    icon: Users,
    isActive: false,
    items: [],
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left"
        >
          <div className="flex size-8 items-center justify-center rounded-md border text-sm font-semibold">
            B
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">BFS Operations</div>
            <div className="truncate text-xs text-muted-foreground">
              Corporate and franchise
            </div>
          </div>
        </button>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;

              return item.items.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} isActive={item.isActive}>
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={subItem.title === "Retail"}>
                              <a href="#">{subItem.title}</a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} isActive={item.isActive}>
                    <Icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
