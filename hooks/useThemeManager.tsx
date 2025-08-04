
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

export const useThemeManager = () => {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced theme change handler with error handling and DOM updates
  const changeTheme = useCallback((newTheme: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Temporarily disable transitions to prevent flash
      document.documentElement.classList.add('theme-transition-disable');
      
      setTheme(newTheme);
      
      // Re-enable transitions after a short delay
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition-disable');
        
        // Force a reflow to ensure CSS variables are applied
        const computedStyle = getComputedStyle(document.documentElement);
        computedStyle.getPropertyValue('--background');
        
        // Dispatch a custom event for components that need to react to theme changes
        window.dispatchEvent(new CustomEvent('themeChanged', { 
          detail: { theme: newTheme } 
        }));
      }, 50);
      
    } catch (error) {
      console.error('Failed to change theme:', error);
      // Re-enable transitions even if there's an error
      if (typeof window !== 'undefined') {
        document.documentElement.classList.remove('theme-transition-disable');
      }
    }
  }, [setTheme]);

  // Get the current active theme (handles system theme properly)
  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'light';
  
  // Get the effective theme for UI display
  const displayTheme = mounted ? (theme || resolvedTheme || 'light') : 'light';

  return {
    theme,
    resolvedTheme,
    systemTheme,
    currentTheme,
    displayTheme,
    changeTheme,
    mounted,
    isSystemTheme: theme === 'system'
  };
};
