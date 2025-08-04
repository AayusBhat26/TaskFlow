"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette } from "lucide-react";

export function SimpleThemeToggle() {
  const { theme, setTheme, themes } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <Palette className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  const themeLabels: Record<string, string> = {
    light: "Light",
    dark: "Dark",
    system: "System",
    ocean: "Ocean",
    forest: "Forest",
    sunset: "Sunset",
    midnight: "Midnight",
    cherry: "Cherry",
    cyber: "Cyber",
    autumn: "Autumn",
    lavender: "Lavender",
    arctic: "Arctic",
    volcano: "Volcano"
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          {themeLabels[theme || 'light'] || 'Theme'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        {themes?.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption}
            onClick={() => setTheme(themeOption)}
            className={theme === themeOption ? "bg-accent" : ""}
          >
            <div className="flex items-center gap-2">
              <div 
                className={`w-4 h-4 rounded-full border-2 border-border ${themeOption}`}
                style={{
                  backgroundColor: `hsl(var(--primary))`,
                }}
              />
              {themeLabels[themeOption] || themeOption}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
