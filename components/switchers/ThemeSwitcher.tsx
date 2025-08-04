"use client";

import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { HoverCard } from "../ui/hover-card";
import { HoverCardContent } from "@radix-ui/react-hover-card";

interface Props {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null;
  size?: "default" | "sm" | "lg" | "icon" | null;
  alignHover?: "center" | "start" | "end";
  alignDropdown?: "center" | "start" | "end";
}

export const ThemeSwitcher = ({
  size = "default",
  variant = "default",
  alignHover = "center",
  alignDropdown = "center",
}: Props) => {
  const { setTheme } = useTheme();
  const t = useTranslations("COMMON");

  return (
    <HoverCard openDelay={250} closeDelay={250}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:-rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle Theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={alignDropdown} className="max-h-80 overflow-y-auto">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("ocean")}>
            Ocean
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("forest")}>
            Forest
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("sunset")}>
            Sunset
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("midnight")}>
            Midnight
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("cherry")}>
            Cherry
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("cyber")}>
            Cyber
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("autumn")}>
            Autumn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("lavender")}>
            Lavender
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("arctic")}>
            Arctic
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("volcano")}>
            Volcano
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <HoverCardContent align={alignHover}>
        <span>{t("THEME_HOVER")}</span>
      </HoverCardContent>
    </HoverCard>
  );
};
