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
      enableColorScheme={true}
      forcedTheme={undefined}
      value={{
        light: "light",
        dark: "dark",
        system: "system",
        ocean: "ocean",
        forest: "forest",
        sunset: "sunset",
        midnight: "midnight",  
        cherry: "cherry",
        cyber: "cyber",
        autumn: "autumn",
        lavender: "lavender",
        arctic: "arctic",
        volcano: "volcano"
      }}
    >
      <div vaul-drawer-wrapper="" className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </NextThemesProvider>
  );
};
