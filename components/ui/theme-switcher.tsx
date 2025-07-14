"use client";

import * as React from "react";
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
  Palette,
  Cherry,
  Zap,
  Leaf,
  Flower2,
  Snowflake,
  Flame
} from "lucide-react";
import { useThemeManager } from "@/hooks/useThemeManager";

const themes = [
  {
    name: "light",
    label: "Light",
    icon: Sun,
    description: "Clean and bright",
    category: "Classic"
  },
  {
    name: "dark", 
    label: "Dark",
    icon: Moon,
    description: "Easy on the eyes",
    category: "Classic"
  },
  {
    name: "system",
    label: "System",
    icon: Monitor,
    description: "Follow system preference",
    category: "Classic"
  },
  {
    name: "ocean",
    label: "Ocean",
    icon: Waves,
    description: "Cool blue vibes",
    category: "Nature"
  },
  {
    name: "forest",
    label: "Forest", 
    icon: Trees,
    description: "Natural green tones",
    category: "Nature"
  },
  {
    name: "sunset",
    label: "Sunset",
    icon: Sunset,
    description: "Warm orange hues",
    category: "Nature"
  },
  {
    name: "midnight",
    label: "Midnight",
    icon: StarIcon,
    description: "Deep purple mystery",
    category: "Dark"
  },
  {
    name: "cherry",
    label: "Cherry Blossom",
    icon: Cherry,
    description: "Soft pink elegance",
    category: "Nature"
  },
  {
    name: "cyber",
    label: "Cyberpunk",
    icon: Zap,
    description: "Neon green energy",
    category: "Dark"
  },
  {
    name: "autumn",
    label: "Autumn",
    icon: Leaf,
    description: "Warm earth tones",
    category: "Nature"
  },
  {
    name: "lavender",
    label: "Lavender",
    icon: Flower2,
    description: "Gentle purple calm",
    category: "Light"
  },
  {
    name: "arctic",
    label: "Arctic",
    icon: Snowflake,
    description: "Cool crystalline",
    category: "Light"
  },
  {
    name: "volcano",
    label: "Volcano",
    icon: Flame,
    description: "Fiery red passion",
    category: "Bold"
  }
];

export function ThemeSwitcher() {
  const { displayTheme, changeTheme, mounted } = useThemeManager();

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-9 h-9">
        <Palette className="h-4 w-4" />
      </Button>
    );
  }

  const currentTheme = themes.find(t => t.name === displayTheme) || themes[0];
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
      <DropdownMenuContent align="end" className="w-72 max-h-96 overflow-y-auto">
        {["Classic", "Light", "Nature", "Dark", "Bold"].map((category) => {
          const categoryThemes = themes.filter(t => t.category === category);
          if (categoryThemes.length === 0) return null;
          
          return (
            <div key={category}>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {category}
              </div>
              {categoryThemes.map((themeOption) => {
                const ThemeIcon = themeOption.icon;
                return (
                  <DropdownMenuItem
                    key={themeOption.name}
                    onClick={() => changeTheme(themeOption.name)}
                    className={`flex items-center gap-3 p-3 cursor-pointer mx-1 mb-1 rounded-md ${
                      displayTheme === themeOption.name ? 'bg-accent ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      displayTheme === themeOption.name 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <ThemeIcon className="h-3 w-3" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-medium text-sm">{themeOption.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {themeOption.description}
                      </span>
                    </div>
                    {displayTheme === themeOption.name && (
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    )}
                  </DropdownMenuItem>
                );
              })}
              {category !== "Bold" && <div className="my-1 border-t border-border"></div>}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
