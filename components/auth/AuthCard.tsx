"use client";

import * as React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { SignUpCardContent } from "./SignUpCardContent";
import { SignInCardContent } from "./SignInCardContent";
import { ArrowLeft, Sparkles, Star, Zap } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useRouteLoading } from "@/hooks/useRouteLoading";
import {useState} from "react";

interface Props {
  signInCard?: boolean;
}

export const AuthCard = ({ signInCard }: Props) => {
  const t = useTranslations("AUTH");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { isLoading: isNavigating, startLoading } = useRouteLoading();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  const handleAuthNavigation = (href: string) => {
    startLoading();
    router.push(href);
  };

  React.useEffect(() => {
    setIsClient(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto py-2" suppressHydrationWarning>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div 
          className="absolute w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-float"
          style={{ 
            top: '-20%', 
            left: '-10%',
            transform: isClient ? `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)` : 'translate(0px, 0px)'
          }}
        />
        <div 
          className="absolute w-48 h-48 bg-gradient-to-br from-accent/15 to-secondary/15 rounded-full blur-2xl animate-float"
          style={{ 
            bottom: '-20%', 
            right: '-10%',
            animationDelay: '2s',
            transform: isClient ? `translate(${mousePosition.x * -0.008}px, ${mousePosition.y * -0.008}px)` : 'translate(0px, 0px)'
          }}
        />
      </div>

      {/* Back to Home Button */}
      <div className="absolute -top-8 left-0">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary transition-colors duration-200 group text-xs"
          onClick={() => {
            startLoading();
            router.push(`/${locale}`);
          }}
        >
          <ArrowLeft className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform duration-200" />
          Back
        </Button>
      </div>

      {/* Main Card */}
      <Card className="relative bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-60" />
        
        {/* Header */}
        <CardHeader className="relative z-10 text-center pb-3">
          {/* Logo */}
          <div className="mx-auto mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5 text-primary-foreground"
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
          </div>

          {/* Brand */}
          <div className="mb-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
              TaskFlow
            </h1>
            <p className="text-xs text-muted-foreground">
              Your Productivity Partner
            </p>
          </div>

          {/* Title & Description */}
          <CardTitle className="text-lg font-bold mb-1">
            {signInCard ? t("SIGN_IN.TITLE") : t("SIGN_UP.TITLE")}
          </CardTitle>
          <CardDescription className="text-sm">
            {signInCard ? t("SIGN_IN.DESC") : t("SIGN_UP.DESC")}
          </CardDescription>
        </CardHeader>

        {/* Form Content */}
        <div className="relative z-10 px-4 pb-4">
          {signInCard ? <SignInCardContent /> : <SignUpCardContent />}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-3 right-3 w-3 h-3 bg-primary/20 rounded-sm rotate-45 animate-float" />
        <div className="absolute bottom-3 left-3 w-2 h-2 bg-accent/20 rounded-sm rotate-12 animate-float" style={{ animationDelay: '1s' }} />
        
        {/* Interactive Squares */}
        <div className="absolute top-3 left-3 flex gap-1">
          <div className="w-1.5 h-1.5 bg-green-400/60 rounded-sm animate-pulse" />
          <div className="w-1.5 h-1.5 bg-yellow-400/60 rounded-sm animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="w-1.5 h-1.5 bg-red-400/60 rounded-sm animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </Card>

      {/* Bottom Link - More Compact */}
      <div className="relative z-30 text-center mt-2 pointer-events-auto">
        <div className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-lg p-2 hover:border-primary/30 transition-colors duration-200">
          <p className="text-xs text-muted-foreground">
            {signInCard
              ? t("SIGN_IN.DONT_HAVE_ACCOUNT.FIRST")
              : t("SIGN_UP.HAVE_ACCOUNT.FIRST")}{" "}
            <button
              className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200 underline-offset-4 hover:underline cursor-pointer pointer-events-auto inline-block px-1 py-0.5 rounded-md hover:bg-primary/10 disabled:opacity-50"
              onClick={() => handleAuthNavigation(signInCard ? `/${locale}/sign-up` : `/${locale}/sign-in`)}
              disabled={isNavigating}
            >
              {isNavigating ? "Loading..." : (signInCard
                ? t("SIGN_IN.DONT_HAVE_ACCOUNT.SECOND")
                : t("SIGN_UP.HAVE_ACCOUNT.SECOND"))}
            </button>
          </p>
        </div>
      </div>

      {/* Compact Features Preview - Removed to save space */}
    </div>
  );
};
