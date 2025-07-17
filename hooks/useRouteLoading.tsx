
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LoadingState } from "@/components/ui/loadingState";

let navigationStartTime = 0;

export const useRouteLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // Start loading when navigation begins
  const startLoading = () => {
    navigationStartTime = Date.now();
    setIsLoading(true);
  };

  // Stop loading when route changes
  useEffect(() => {
    if (isLoading) {
      const loadingTime = Date.now() - navigationStartTime;
      const minLoadingTime = 300; // Minimum loading time for better UX
      
      if (loadingTime < minLoadingTime) {
        const timeout = setTimeout(() => {
          setIsLoading(false);
        }, minLoadingTime - loadingTime);
        
        return () => clearTimeout(timeout);
      } else {
        setIsLoading(false);
      }
    }
  }, [pathname, isLoading]);

  return { isLoading, startLoading };
};

interface RouteLoadingOverlayProps {
  isVisible: boolean;
}

export const RouteLoadingOverlay = ({ isVisible }: RouteLoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center route-loading-enter">
      <div className="bg-card/95 border border-border/50 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center gap-6">
          {/* Animated TaskFlow Logo */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-primary via-primary/80 to-accent rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <svg
                className="w-10 h-10 text-primary-foreground"
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
            {/* Rotating ring */}
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary/40 rounded-2xl animate-spin" />
          </div>
          
          {/* Loading Text */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TaskFlow
            </h3>
            <p className="text-sm text-muted-foreground animate-pulse">
              Loading your workspace...
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-48 h-2 bg-secondary/30 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full route-progress-bar" />
          </div>
          
          {/* Loading dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
