"use client";

import { CustomColors, Tag as TagType } from "@prisma/client";
import { Check, Tag } from "lucide-react";
import { useMemo } from "react";

interface Props {
  tag: TagType;
}

export const TagItem = ({ tag: { color, id, name } }: Props) => {
  const tagColor = useMemo(() => {
    switch (color) {
      case CustomColors.PURPLE:
        return "text-primary hover:text-primary/80";
      case CustomColors.GREEN:
        return "text-accent-foreground hover:text-accent-foreground/80";
      case CustomColors.RED:
        return "text-destructive hover:text-destructive/80";
      case CustomColors.BLUE:
        return "text-primary hover:text-primary/80";
      case CustomColors.CYAN:
        return "text-secondary-foreground hover:text-secondary-foreground/80";
      case CustomColors.EMERALD:
        return "text-accent-foreground hover:text-accent-foreground/80";
      case CustomColors.INDIGO:
        return "text-primary hover:text-primary/80";
      case CustomColors.LIME:
        return "text-accent-foreground hover:text-accent-foreground/80";
      case CustomColors.ORANGE:
        return "text-muted-foreground hover:text-muted-foreground/80";
      case CustomColors.FUCHSIA:
        return "text-primary hover:text-primary/80";
      case CustomColors.PINK:
        return "text-secondary-foreground hover:text-secondary-foreground/80";
      case CustomColors.YELLOW:
        return "text-muted-foreground hover:text-muted-foreground/80";
      default:
        return "text-accent-foreground hover:text-accent-foreground/80";
    }
  }, [color]);

  return (
    <div className="w-fit flex gap-2 items-center px-2.25 py-0.5 h-fit text-xs rounded-lg border border-input bg-background">
      <Tag className={`w-3 h-3 ${tagColor}`} size={16} />
      <span>{name}</span>
    </div>
  );
};
