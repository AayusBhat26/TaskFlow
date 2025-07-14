"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loadingState";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ThemeCard } from "./ThemeCard";

export const Theme = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
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
          Select how you would like your interface to look. Select theme from
          dark, light or system.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap justify-center gap-6">
        <ThemeCard onTheme={setTheme} theme="light" activeTheme={theme} />
        <ThemeCard onTheme={setTheme} theme="dark" activeTheme={theme} />
        <ThemeCard onTheme={setTheme} theme="system" activeTheme={theme} />
      </CardContent>
    </Card>
  );
};
