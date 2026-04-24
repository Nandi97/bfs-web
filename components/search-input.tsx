"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SearchInput() {
  return (
    <Button
      variant="outline"
      className="text-muted-foreground relative h-9 w-full justify-start rounded-[0.5rem] text-sm font-normal shadow-none md:w-40 lg:w-64"
    >
      <Search className="mr-2 size-4" />
      Search...
      <kbd className="bg-muted pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-6 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
