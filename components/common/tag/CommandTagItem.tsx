import { Button } from "@/components/ui/button";
import { CommandItem } from "@/components/ui/command";
import { Check, Pencil, Tag } from "lucide-react";
import { CustomColors, Tag as TagType } from "@prisma/client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  tag: TagType;
  currentActiveTags: TagType[];
  onSelectActiveTag: (id: string) => void;
  onEditTagInfo: (tag: TagType) => void;
}

export const CommandTagItem = ({
  tag: { color, id, name, workspaceId },
  currentActiveTags,
  onSelectActiveTag,
  onEditTagInfo,
}: Props) => {
  const isActive = useMemo(() => {
    return (
      currentActiveTags.length > 0 &&
      currentActiveTags.find((activeTag) => activeTag.id === id)
    );
  }, [currentActiveTags, id]);
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslations("TASK.HEADER.TAG");

  const tagColor = useMemo(() => {
    switch (color) {
      case CustomColors.BLUE:
        return "text-blue-600 hover:text-blue-500 border-blue-600 hover:border-blue-500";
      case CustomColors.EMERALD:
        return "text-emerald-600 hover:text-emerald-500 border-emerald-600 hover:border-emerald-500";
      case CustomColors.LIME:
        return "text-lime-600 hover:text-lime-500 border-lime-600 hover:border-lime-500";
      case CustomColors.ORANGE:
        return "text-orange-600 hover:text-orange-500 border-orange-600 hover:border-orange-500";
      case CustomColors.PINK:
        return "text-pink-600 hover:text-pink-500 border-pink-600 hover:border-pink-500";
      case CustomColors.YELLOW:
        return "text-yellow-600 hover:text-yellow-500 border-yellow-600 hover:border-yellow-500";
      case CustomColors.RED:
        return "text-red-600 hover:text-red-500 border-red-600 hover:border-red-500";
      case CustomColors.PURPLE:
        return "text-purple-600 hover:text-purple-500 border-purple-600 hover:border-purple-500";
      case CustomColors.GREEN:
        return "text-green-600 hover:text-green-500 border-green-600 hover:border-green-500";
      case CustomColors.CYAN:
        return "text-cyan-600 hover:text-cyan-500 border-cyan-600 hover:border-cyan-500";
      case CustomColors.INDIGO:
        return "text-indigo-600 hover:text-indigo-500 border-indigo-600 hover:border-indigo-500";
      case CustomColors.FUCHSIA:
        return "text-fuchsia-600 hover:text-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500";
      default:
        return "text-blue-600 hover:text-blue-500 border-blue-600 hover:border-blue-500";
    }
  }, [color]);
  return (
    <CommandItem
      className="p-0 relative"
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <Button
        onClick={() => {
          onSelectActiveTag(id);
        }}
        size={"sm"}
        variant={"ghost"}
        className={`w-full h-fit justify-between px-2 py-1.5 text-xs ${tagColor}`}
      >
        <p className="flex">
          <Tag className="mr-2" size={16} />
          <span className="text-secondary-foreground">{name}</span>
        </p>
        {isActive && <Check size={16} />}
      </Button>
      {isHovered && (
        <Button
          onClick={() => {
            onEditTagInfo({
              id,
              color,
              name,
              workspaceId,
            });
          }}
          className="absolute top-1/2 right-6 translate-y-[-50%] h-fit rounded-none z-20 bg-transparent hover:bg-transparent text-muted-foreground"
        >
          <Pencil size={16} />
        </Button>
      )}
    </CommandItem>
  );
};
