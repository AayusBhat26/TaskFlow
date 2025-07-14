"use client";

import { Check, Globe, LogOut, Moon, Settings2, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { UserAvatar } from "../ui/user-avatar";
import { useTheme } from "next-themes";
import { useChangeLocale } from "@/hooks/useChangeLocale";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Image from "next/image";

interface Props {
  profileImage?: string | null;
  username: string;
  email: string;
}

export const User = ({ profileImage, username, email }: Props) => {
  const { theme, setTheme } = useTheme();
  const { onSelectChange } = useChangeLocale();
  const lang = useLocale();
  const t = useTranslations("COMMON");

  const logOutHandler = () => {
    signOut({
      callbackUrl: `${window.location.origin}/${lang}`,
    });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ml-2">
        <UserAvatar className="w-10 h-10" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="">
        <div className="flex items-center gap-1 px-2">
          {profileImage ? (
            <Image
              src={profileImage}
              alt="profile image"
              className="w-10 h-10 rounded-full object-cover"
              width={300}
              height={300}
            />
          ) : (
            <UserAvatar className="w-8 h-8" />
          )}

          <div>
            <DropdownMenuLabel>{username}</DropdownMenuLabel>
            <DropdownMenuLabel>{email}</DropdownMenuLabel>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer gap-2">
              <Moon size={16} className="hidden dark:inline-block" />
              <Sun size={16} className="dark:hidden" />
              <span>{t("THEME_HOVER")}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent sideOffset={10}>
                <DropdownMenuItem
                  onClick={() => {
                    setTheme("dark");
                  }}
                  className="flex justify-between items-center cursor-pointer"
                >
                  <span>{t("DARK")}</span>
                  {theme === "dark" && <Check size={14} />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTheme("light");
                  }}
                  className="flex justify-between items-center cursor-pointer"
                >
                  <span>{t("LIGHT")}</span>
                  {theme === "light" && <Check size={14} />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTheme("system");
                  }}
                  className="flex justify-between items-center cursor-pointer"
                >
                  <span>{t("SYSTEM")}</span>
                  {theme === "system" && <Check size={14} />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer gap-2">
              <Globe size={16} />
              <span>{t("LANG_HOVER")}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent sideOffset={10}>
                <DropdownMenuItem
                  onClick={() => {
                    onSelectChange("en");
                  }}
                  className="flex justify-between items-center cursor-pointer"
                >
                  <span>English</span>
                  {lang === "en" && <Check size={14} />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onSelectChange("te");
                  }}
                  className="flex justify-between items-center cursor-pointer"
                >
                  <span>Telugu</span>
                  {lang === "te" && <Check size={14} />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem className="cursor-pointer gap-2" asChild>
            <Link href={"/dashboard/settings"}>
              <Settings2 size={16} /> {t("SETTINGS")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logOutHandler}
          className="cursor-pointer gap-2"
        >
          <LogOut size={16} />
          {t("LOG_OUT")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
