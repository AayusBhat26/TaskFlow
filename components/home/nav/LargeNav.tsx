"use client";
import { AppleLogo } from "@/components/svg/AppleLogo";
import { LocaleSwitcher } from "@/components/switchers/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/switchers/ThemeSwitcher";
import { buttonVariants, Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loadingState";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRouteLoading } from "@/hooks/useRouteLoading";

export const LargeNav = () => {
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const router = useRouter();
  const { startLoading } = useRouteLoading();

  const handleLogin = async () => {
    setIsLoginLoading(true);
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
    startLoading();
    try {
      router.push('/sign-up');
    } catch (error) {
      console.error('Navigation error:', error);
      setIsSignupLoading(false);
    }
  };

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
              Feature Hub
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
                <div className="w-[600px] p-8 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border border-border/30 rounded-2xl shadow-2xl">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                      Powerful Features
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Everything you need for seamless productivity
                    </p>
                  </div>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {navLinks.map((link, i) => {
                      const icons = {
                        'Mind Maps': '🧠',
                        'Tasks': '✅', 
                        'Calendar': '📅',
                        'Pomodoro': '⏰'
                      };
                      
                      const descriptions = {
                        'Mind Maps': 'Visual brainstorming',
                        'Tasks': 'Project management',
                        'Calendar': 'Schedule planning', 
                        'Pomodoro': 'Focus sessions'
                      };
                      
                      return (
                        <Button
                          key={i}
                          onClick={() => {
                            scrollToHash(link.href);
                          }}
                          className="group h-auto p-4 bg-gradient-to-br from-background/60 to-background/40 hover:from-primary/10 hover:to-accent/10 border border-border/40 hover:border-primary/40 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                          <div className="flex flex-col items-center text-center space-y-2">
                            <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                              {icons[link.title as keyof typeof icons]}
                            </div>
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {link.title}
                            </div>
                            <div className="text-xs text-muted-foreground group-hover:text-accent-foreground transition-colors">
                              {descriptions[link.title as keyof typeof descriptions]}
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                  
                  {/* Footer CTA */}
                  <div className="mt-8 pt-6 border-t border-border/30 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Ready to boost your productivity?
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50"
                      onClick={handleSignup}
                      disabled={isSignupLoading}
                    >
                      {isSignupLoading ? (
                        <>
                          <LoadingState className="mr-2" />
                          Getting Started...
                        </>
                      ) : (
                        "Get Started"
                      )}
                    </Button>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Right side - Theme and Actions */}
      <div className="absolute right-0 flex items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="border-b border-transparent hover:border-primary duration-200 transition-colors disabled:opacity-50"
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
        </div>
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
    </div>
  );
};
