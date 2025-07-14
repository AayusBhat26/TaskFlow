"use client";
import { AppleLogo } from "@/components/svg/AppleLogo";
import { LocaleSwitcher } from "@/components/switchers/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/switchers/ThemeSwitcher";
import { buttonVariants, Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { navLinks } from "@/lib/constants";
import { scrollToHash } from "@/lib/utils";
import Link from "next/link";

export const LargeNav = () => {
  return (
    <div className="container md:flex py-4 max-w-screen-2xl items-center justify-center hidden relative">
      {/* Left side - Logo */}
      <div className="absolute left-0 flex items-center">
        <Button
          className="w-fit bg-transparent text-secondary-foreground hover:bg-transparent flex items-center gap-2 hover:scale-105 transition-transform duration-200"
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
            <svg 
              className="w-6 h-6 text-primary-foreground" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" 
              />
            </svg>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              TaskFlow
            </p>
            <p className="text-xs text-muted-foreground font-medium -mt-1">
              Productivity Hub
            </p>
          </div>
        </Button>
      </div>

      {/* Center - Navigation */}
      <div className="flex items-center justify-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-lg font-medium bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-border/50 rounded-full px-6">
                Features
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[500px] gap-3 p-6 md:grid-cols-2">
                  {navLinks.map((link, i) => (
                    <div key={i}>
                      <Button
                        onClick={() => {
                          scrollToHash(link.href);
                        }}
                        className="w-full text-left bg-transparent text-secondary-foreground block select-none space-y-1 rounded-lg p-4 leading-none no-underline outline-none transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground border border-transparent hover:border-primary/20"
                      >
                        <div className="font-medium text-base">{link.title}</div>
                        <div className="text-sm text-muted-foreground">Explore {link.title.toLowerCase()}</div>
                      </Button>
                    </div>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Right side - Theme and Actions */}
      <div className="absolute right-0 flex items-center gap-4">
        <ThemeSwitcher />
        <LocaleSwitcher />
        <div className="flex gap-2">
          <Link
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
            })}
            href="#"
          >
            Log in
          </Link>
          <Link
            className={buttonVariants({
              variant: "default",
              size: "sm",
            }) + " bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"}
            href="#"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};
