"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

type SubItem = { title: string; href: string };
type NavItem = {
  title: string;
  icon: React.ElementType;
  href?: string;
  items: SubItem[];
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: Building2,
    href: "/",
    items: [],
  },
  {
    title: "Operations",
    icon: BriefcaseBusiness,
    items: [
      { title: "Retail",     href: "#" },
      { title: "Services",   href: "#" },
      { title: "Inventory",  href: "/inventory" },
    ],
  },
  {
    title: "Planning",
    icon: CalendarRange,
    items: [
      { title: "Staffing",    href: "#" },
      { title: "Promotions",  href: "#" },
    ],
  },
  {
    title: "Team",
    icon: Users,
    href: "#",
    items: [],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  const isSubActive = (href: string) =>
    href !== "#" && (pathname === href || pathname.startsWith(href + "/"));

  const isGroupActive = (item: NavItem) =>
    item.items.some((sub) => isSubActive(sub.href));

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
              const groupActive = isGroupActive(item);
              const topActive =
                item.href !== undefined &&
                item.href !== "#" &&
                (pathname === item.href || pathname.startsWith(item.href + "/"));

              return item.items.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={groupActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} isActive={groupActive}>
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSubActive(subItem.href)}
                            >
                              <Link href={subItem.href}>{subItem.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={topActive}
                    asChild={!!item.href && item.href !== "#"}
                  >
                    {item.href && item.href !== "#" ? (
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    ) : (
                      <>
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                      </>
                    )}
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
