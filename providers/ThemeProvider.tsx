"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemesProvider 
      {...props}
      attribute="class"
      defaultTheme="light"
      themes={[
        "light", 
        "dark", 
        "system",
        "ocean", 
        "forest", 
        "sunset", 
        "midnight",
        "cherry",
        "cyber",
        "autumn",
        "lavender",
        "arctic",
        "volcano"
      ]}
      enableSystem
      disableTransitionOnChange={false}
      storageKey="taskflow-theme"
      enableColorScheme={false}
      forcedTheme={undefined}
    >
      {children}
    </NextThemesProvider>
  );
};
