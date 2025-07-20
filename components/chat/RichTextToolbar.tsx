"use client";

import React, { useState } from "react";
import { 
  Bold, 
  Italic, 
  Code, 
  Link,
  AtSign,
  Type,
  Eye,
  EyeOff,
  Heading1,
  Heading2,
  Heading3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextToolbarProps {
  onFormatApply: (format: string, wrapper?: string) => void;
  onPreviewToggle: () => void;
  isPreviewMode: boolean;
  className?: string;
}

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
  onFormatApply,
  onPreviewToggle,
  isPreviewMode,
  className,
}) => {
  const formatButtons = [
    {
      icon: Bold,
      label: "Bold",
      format: "**",
      shortcut: "Ctrl+B"
    },
    {
      icon: Italic,
      label: "Italic", 
      format: "*",
      shortcut: "Ctrl+I"
    },
    {
      icon: Code,
      label: "Inline Code",
      format: "`",
      shortcut: "Ctrl+E"
    },
    {
      icon: Heading1,
      label: "Heading 1",
      format: "# ",
      shortcut: "Ctrl+1"
    },
    {
      icon: Heading2,
      label: "Heading 2",
      format: "## ",
      shortcut: "Ctrl+2"
    },
    {
      icon: Heading3,
      label: "Heading 3",
      format: "### ",
      shortcut: "Ctrl+3"
    },
    {
      icon: AtSign,
      label: "Mention User",
      format: "@",
      shortcut: "@"
    }
  ];

  const handleFormatClick = (format: string) => {
    onFormatApply(format);
  };

  return (
    <div className={cn("flex items-center space-x-1 p-2 border-b border-gray-200 dark:border-gray-700", className)}>
      {formatButtons.map((button) => {
        const Icon = button.icon;
        return (
          <Button
            key={button.label}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleFormatClick(button.format)}
            title={`${button.label} (${button.shortcut})`}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
      
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      
      <Button
        variant={isPreviewMode ? "default" : "ghost"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onPreviewToggle}
        title={isPreviewMode ? "Edit Mode" : "Preview Mode"}
      >
        {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
};
