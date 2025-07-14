"use client";

import ActiveLink from "@/components/ui/active-link";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Workspace, CustomColors } from "@prisma/client";
import Image from "next/image";
import { useMemo } from "react";

interface Props {
  workspace: Workspace;
  href: string;
}

export const WorkspaceComponent = ({
  workspace: { id, image, name, color },
  href,
}: Props) => {
  const workspaceColor = useMemo(() => {
    switch (color) {
      case CustomColors.BLUE:
        return "bg-blue-600 hover:bg-blue-500";
      case CustomColors.EMERALD:
        return "bg-emerald-600 hover:bg-emerald-500";
      case CustomColors.LIME:
        return "bg-lime-600 hover:bg-lime-500";
      case CustomColors.ORANGE:
        return "bg-orange-600 hover:bg-orange-500";
      case CustomColors.PINK:
        return "bg-pink-600 hover:bg-pibk-500";
      case CustomColors.YELLOW:
        return "bg-yellow-600 hover:bg-yellow-500";
      case CustomColors.RED:
        return "bg-red-600 hover:bg-red-500";
      case CustomColors.PURPLE:
        return "bg-purple-600 hover:bg-purple-500";
      case CustomColors.GREEN:
        return "bg-green-600 hover:bg-green-500";
      case CustomColors.CYAN:
        return "bg-cyan-600 hover:bg-cyan-500";
      case CustomColors.INDIGO:
        return "bg-indigo-600 hover:bg-indigo-500";
      case CustomColors.FUCHSIA:
        return "bg-fuchsia-600 hover:bg-fuchsia-500";
      default:
        return "bg-blue-600 hover:bg-blue-500";
    }
  }, [color]);
  return (
    <HoverCard openDelay={250} closeDelay={250}>
      <HoverCardTrigger asChild>
        <ActiveLink
          include={`/${href}/${id}`}
          workspaceIcon
          className={`text-white font-bold ${!image && workspaceColor}`}
          variant={image ? "ghost" : "default"}
          href={`${href}/${id}`}
          size={"icon"}
        >
          {image ? (
            <Image
              priority
              className="w-full h-full object-cover rounded-md"
              src={image}
              alt="workspace image"
              height={300}
              width={300}
            />
          ) : (
            <p>{name[0].toUpperCase()}</p>
          )}
        </ActiveLink>
      </HoverCardTrigger>
      <HoverCardContent align="start">
        <span>{name}</span>
      </HoverCardContent>
    </HoverCard>
  );
};
