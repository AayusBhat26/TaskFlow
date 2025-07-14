"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Sun, 
  Moon, 
  Waves, 
  Trees, 
  Sunset, 
  StarIcon,
  Monitor,
  Palette
} from "lucide-react";

const themes = [
  {
    name: "light",
    label: "Light",
    icon: Sun,
    description: "Clean and bright"
  },
  {
    name: "dark", 
    label: "Dark",
    icon: Moon,
    description: "Easy on the eyes"
  },
  {
    name: "ocean",
    label: "Ocean",
    icon: Waves,
    description: "Cool blue vibes"
  },
  {
    name: "forest",
    label: "Forest", 
    icon: Trees,
    description: "Natural green tones"
  },
  {
    name: "sunset",
    label: "Sunset",
    icon: Sunset,
    description: "Warm orange hues"
  },
  {
    name: "midnight",
    label: "Midnight",
    icon: StarIcon,
    description: "Deep purple mystery"
  },
  {
    name: "system",
    label: "System",
    icon: Monitor,
    description: "Follow system preference"
  }
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-9 h-9">
        <Palette className="h-4 w-4" />
      </Button>
    );
  }

  const currentTheme = themes.find(t => t.name === theme) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-9 h-9 border-2 hover:scale-105 transition-transform duration-200"
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {themes.map((themeOption) => {
          const ThemeIcon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.name}
              onClick={() => setTheme(themeOption.name)}
              className={`flex items-center gap-3 p-3 cursor-pointer ${
                theme === themeOption.name ? 'bg-accent' : ''
              }`}
            >
              <ThemeIcon className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{themeOption.label}</span>
                <span className="text-xs text-muted-foreground">
                  {themeOption.description}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
