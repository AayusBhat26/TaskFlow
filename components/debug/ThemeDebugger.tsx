"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeDebugger() {
  const { theme, setTheme, themes, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [htmlClass, setHtmlClass] = useState("");

  useEffect(() => {
    setMounted(true);
    
    // Check what classes are actually applied to the HTML element
    const updateHtmlClass = () => {
      const htmlElement = document.documentElement;
      setHtmlClass(htmlElement.className);
    };
    
    updateHtmlClass();
    
    // Create observer to watch for class changes
    const observer = new MutationObserver(updateHtmlClass);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return <div>Loading theme debugger...</div>;
  }

  return (
    <div className="fixed top-4 right-4 z-50 p-4 bg-card border rounded-lg shadow-lg max-w-sm">
      <h3 className="font-semibold mb-2">Theme Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Current Theme:</strong> {theme || "undefined"}
        </div>
        
        <div>
          <strong>Resolved Theme:</strong> {resolvedTheme || "undefined"}
        </div>
        
        <div>
          <strong>Available Themes:</strong> {themes?.join(", ") || "none"}
        </div>
        
        <div>
          <strong>HTML Classes:</strong> 
          <code className="block mt-1 p-2 bg-muted rounded text-xs break-all">
            {htmlClass}
          </code>
        </div>
        
        <div>
          <strong>CSS Variables:</strong>
          <div className="mt-1 space-y-1">
            <div className="flex items-center gap-2">
              <span>Background:</span>
              <div 
                className="w-4 h-4 rounded border" 
                style={{ backgroundColor: `hsl(var(--background))` }}
              />
              <code className="text-xs">hsl(var(--background))</code>
            </div>
            <div className="flex items-center gap-2">
              <span>Primary:</span>
              <div 
                className="w-4 h-4 rounded border" 
                style={{ backgroundColor: `hsl(var(--primary))` }}
              />
              <code className="text-xs">hsl(var(--primary))</code>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="text-xs font-medium">Quick Theme Test:</div>
        <div className="flex flex-wrap gap-1">
          {themes?.slice(0, 6).map((themeName) => (
            <Button
              key={themeName}
              size="sm"
              variant={theme === themeName ? "default" : "outline"}
              onClick={() => setTheme(themeName)}
              className="text-xs"
            >
              {themeName}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
