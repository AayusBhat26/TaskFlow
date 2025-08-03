"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface Props {
  children: React.ReactNode;
}

interface ToggleSidebarContext {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ToggleSidebarCtx = createContext<ToggleSidebarContext | null>(
  null
);

export const ToggleSidebarProvider = ({ children }: Props) => {
  // Start with sidebar open on larger screens, closed on mobile
  const [isOpen, setIsOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);

  useEffect(() => {
    const handleResize = () => {
      // Auto-open sidebar on desktop, auto-close on mobile
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ToggleSidebarCtx.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </ToggleSidebarCtx.Provider>
  );
};

export const useToggleSidebar = () => {
  const ctx = useContext(ToggleSidebarCtx);
  if (!ctx) throw new Error("invalid use");

  return ctx;
};
