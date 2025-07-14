"use client";
import { AppleLogo } from "@/components/svg/AppleLogo";
import { LocaleSwitcher } from "@/components/switchers/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/switchers/ThemeSwitcher";
import { Button, buttonVariants } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loadingState";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navLinks } from "@/lib/constants";
import { scrollToHash } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRouteLoading } from "@/hooks/useRouteLoading";

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const router = useRouter();
  const { startLoading } = useRouteLoading();

  const handleLogin = async () => {
    setIsLoginLoading(true);
    setOpen(false);
    startLoading();
    try {
      router.push('/sign-in');
    } catch (error) {
      console.error('Navigation error:', error);
      setIsLoginLoading(false);
    }
  };

  const handleSignup = async () => {
    setIsSignupLoading(true);
    setOpen(false);
    startLoading();
    try {
      router.push('/sign-up');
    } catch (error) {
      console.error('Navigation error:', error);
      setIsSignupLoading(false);
    }
  };
  return (
    <div className="md:hidden py-2 px-2 w-full flex items-center justify-between">
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetTrigger asChild>
          <Button variant={"ghost"} size={"icon"}>
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent
          side={"left"}
          className="h-full flex flex-col justify-between"
        >
          <SheetHeader>
            <SheetTitle asChild>
              <Button
                className="w-fit bg-transparent text-secondary-foreground hover:bg-transparent flex items-center gap-2 hover:scale-105 transition-transform duration-200"
                onClick={() => {
                  setOpen(false);
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
                <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  TaskFlow
                </p>
              </Button>
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="my-4 flex-grow">
            <div className="h-full flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <Button
                  variant={"link"}
                  size={"sm"}
                  onClick={() => {
                    setOpen(false);
                    scrollToHash(link.href);
                  }}
                  className="w-fit text-base text-secondary-foreground font-semibold"
                >
                  {link.title}
                </Button>
              ))}
            </div>
          </ScrollArea>
          <div className="w-full flex flex-col gap-2">
            <Button
              className={`${buttonVariants({ variant: "default" })} disabled:opacity-50`}
              onClick={handleSignup}
              disabled={isSignupLoading}
            >
              {isSignupLoading ? (
                <>
                  <LoadingState className="mr-2" />
                  Signing up...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
            <Button
              className={`${buttonVariants({ variant: "outline" })} disabled:opacity-50`}
              onClick={handleLogin}
              disabled={isLoginLoading}
            >
              {isLoginLoading ? (
                <>
                  <LoadingState className="mr-2" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <LocaleSwitcher
          alignHover="end"
          alignDropdown="end"
          size={"icon"}
          variant={"outline"}
        />
        <ThemeSwitcher
          alignHover="end"
          alignDropdown="end"
          size={"icon"}
          variant={"outline"}
        />
      </div>
    </div>
  );
};
