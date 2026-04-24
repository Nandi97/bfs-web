"use client";

import * as React from "react";
import { SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <Button
      variant="secondary"
      size="icon"
      className="size-8"
      onClick={toggle}
    >
      <SunMoon className="size-4" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
