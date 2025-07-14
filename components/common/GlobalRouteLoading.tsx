"use client";

import { useRouteLoading, RouteLoadingOverlay } from "@/hooks/useRouteLoading";

export const GlobalRouteLoading = () => {
  const { isLoading } = useRouteLoading();
  
  return <RouteLoadingOverlay isVisible={isLoading} />;
};
