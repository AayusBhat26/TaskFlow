"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loadingState";
import { useThemeManager } from "@/hooks/useThemeManager";
import { ThemeCard } from "./ThemeCard";

export const Theme = () => {
  const { displayTheme, changeTheme, mounted } = useThemeManager();

  const themes = [
    { value: "light", category: "Classic" },
    { value: "dark", category: "Classic" },
    { value: "system", category: "Classic" },
    { value: "ocean", category: "Nature" },
    { value: "forest", category: "Nature" },
    { value: "sunset", category: "Nature" },
    { value: "cherry", category: "Nature" },
    { value: "autumn", category: "Nature" },
    { value: "midnight", category: "Dark" },
    { value: "cyber", category: "Dark" },
    { value: "lavender", category: "Light" },
    { value: "arctic", category: "Light" },
    { value: "volcano", category: "Bold" }
  ];

  const groupedThemes = themes.reduce((acc, theme) => {
    if (!acc[theme.category]) {
      acc[theme.category] = [];
    }
    acc[theme.category].push(theme.value);
    return acc;
  }, {} as Record<string, string[]>);

  if (!mounted) {
    return (
      <div>
        <LoadingState className="w-12 h-12" />
      </div>
    );
  }
  
  return (
    <Card className="bg-background border-none shadow-none">
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription className="text-base">
          Choose your perfect theme from our extensive collection. From classic light and dark modes to vibrant nature-inspired themes and bold cyberpunk styles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {Object.entries(groupedThemes).map(([category, categoryThemes]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-4 text-primary">{category} Themes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryThemes.map((themeValue) => (
                <ThemeCard
                  key={themeValue}
                  onTheme={changeTheme}
                  theme={themeValue as any}
                  activeTheme={displayTheme}
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
