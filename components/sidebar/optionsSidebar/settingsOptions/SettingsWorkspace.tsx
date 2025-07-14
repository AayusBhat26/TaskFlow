"use client";

import ActiveLink from "@/components/ui/active-link";
import { Workspace, CustomColors } from "@prisma/client";
import Image from "next/image";
import { useMemo } from "react";

interface Props {
  workspace: Workspace;
  href: string;
}

export const SettingsWorkspace = ({
  href,
  workspace: { color, id, image, name },
}: Props) => {
  const workspaceColor = useMemo(() => {
    switch (color) {
      case CustomColors.BLUE:
        return "bg-blue-600 hover:bg-blue-500 border-blue-600 hover:border-blue-500";
      case CustomColors.EMERALD:
        return "bg-emerald-600 hover:bg-emerald-500 border-emerald-600 hover:border-emerald-500";
      case CustomColors.LIME:
        return "bg-lime-600 hover:bg-lime-500 border-lime-600 hover:border-lime-500";
      case CustomColors.ORANGE:
        return "bg-orange-600 hover:bg-orange-500 border-orange-600 hover:border-orange-500";
      case CustomColors.PINK:
        return "bg-pink-600 hover:bg-pink-500 border-pink-600 hover:border-pink-500";
      case CustomColors.YELLOW:
        return "bg-yellow-600 hover:bg-yellow-500 border-yellow-600 hover:border-yellow-500";
      case CustomColors.RED:
        return "bg-red-600 hover:bg-red-500 border-red-600 hover:border-red-500";
      case CustomColors.PURPLE:
        return "bg-purple-600 hover:bg-purple-500 border-purple-600 hover:border-purple-500";
      case CustomColors.GREEN:
        return "bg-green-600 hover:bg-green-500 border-green-600 hover:border-green-500";
      case CustomColors.CYAN:
        return "bg-cyan-600 hover:bg-cyan-500 border-cyan-600 hover:border-cyan-500";
      case CustomColors.INDIGO:
        return "bg-indigo-600 hover:bg-indigo-500 border-indigo-600 hover:border-indigo-500";
      case CustomColors.FUCHSIA:
        return "bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-600 hover:border-fuchsia-500";
      default:
        return "bg-blue-600 hover:bg-blue-500 border-blue-600 hover:border-blue-500";
    }
  }, [color]);

  return (
    <ActiveLink
      href={`${href}/${id}`}
      variant={"ghost"}
      size={"sm"}
      className="w-full flex justify-start items-center gap-2 overflow-hidden"
    >
      {image ? (
        <Image
          src={image}
          priority
          className="w-7 h-7 object-cover rounded-md"
          alt="workspace image"
          height={300}
          width={300}
        />
      ) : (
        <div
          className={`rounded-md text-white font-bold h-7 w-7 flex justify-center items-center ${workspaceColor}`}
        >
          <p>{name[0].toUpperCase()}</p>
        </div>
      )}
      <p>{name}</p>
    </ActiveLink>
  );
};
