"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/loadingState";

interface NavigationLoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
});

export const useNavigationLoading = () => {
  return useContext(NavigationLoadingContext);
};

interface NavigationLoadingProviderProps {
  children: React.ReactNode;
}

export const NavigationLoadingProvider = ({
  children,
}: NavigationLoadingProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Override router.push to show loading
  useEffect(() => {
    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;
    const originalForward = router.forward;

    // @ts-ignore
    router.push = (href, options) => {
      setIsLoading(true);
      return originalPush(href, options);
    };

    // @ts-ignore
    router.replace = (href, options) => {
      setIsLoading(true);
      return originalReplace(href, options);
    };

    router.back = () => {
      setIsLoading(true);
      return originalBack();
    };

    router.forward = () => {
      setIsLoading(true);
      return originalForward();
    };

    // Hide loading when component unmounts or page changes
    const handleRouteChange = () => {
      setIsLoading(false);
    };

    // Listen for page visibility changes to hide loader
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsLoading(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
      router.forward = originalForward;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  // Hide loading after a timeout as fallback
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  return (
    <NavigationLoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && <NavigationLoadingOverlay />}
    </NavigationLoadingContext.Provider>
  );
};

const NavigationLoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Animated logo/spinner */}
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center animate-pulse">
              <svg
                className="w-8 h-8 text-primary-foreground animate-spin"
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
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Loading TaskFlow
            </h3>
            <p className="text-sm text-muted-foreground">
              Preparing your experience...
            </p>
          </div>
          <LoadingState className="mt-2" />
        </div>
      </div>
    </div>
  );
};
