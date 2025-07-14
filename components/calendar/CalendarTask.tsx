"use client";

import { CalendarItem } from "@/types/extended";
import { useMemo } from "react";
import { CustomColors } from "@prisma/client";
import dayjs from "dayjs";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface Props {
  dayInfo: CalendarItem;
  showMore?: boolean;
}

export const CalendarTask = ({
  dayInfo: {
    taskDate,
    taskId,
    title,
    workspaceColor,
    workspaceId,
    workspaceName,
  },
  showMore,
}: Props) => {
  const color = useMemo(() => {
    switch (workspaceColor) {
      case CustomColors.PURPLE:
        return "bg-purple-600 hover:bg-purple-500";
      case CustomColors.GREEN:
        return "bg-green-600 hover:bg-green-500";
      case CustomColors.RED:
        return "bg-red-600 hover:bg-red-500";
      case CustomColors.BLUE:
        return "bg-blue-600 hover:bg-blue-500";
      case CustomColors.CYAN:
        return "bg-cyan-600 hover:bg-cyan-500";
      case CustomColors.EMERALD:
        return "bg-emerald-600 hover:bg-emerald-500";
      case CustomColors.INDIGO:
        return "bg-indigo-600 hover:bg-indigo-500";
      case CustomColors.LIME:
        return "bg-lime-600 hover:bg-lime-500";
      case CustomColors.ORANGE:
        return "bg-orange-600 hover:bg-orange-500";
      case CustomColors.FUCHSIA:
        return "bg-fuchsia-600 hover:bg-fuchsia-500";
      case CustomColors.PINK:
        return "bg-pink-600 hover:bg-pink-500";
      case CustomColors.YELLOW:
        return "bg-yellow-600 hover:bg-yellow-500";
      default:
        return "bg-green-600 hover:bg-green-500";
    }
  }, [workspaceColor]);

  const t = useTranslations("CALENDAR");

  return (
    <HoverCard openDelay={250} closeDelay={250}>
      <HoverCardTrigger asChild>
        <Link href={`/dashboard/workspace/${workspaceId}/tasks/task/${taskId}`}>
          <div
            className={`shadow-sm rounded-md text-white ${color} bg-opacity-80 dark:bg-opacity-60 transition-colors duration-200 cursor-pointer overflow-hidden ${
              showMore ? "py-1.5 px-4 h-10" : "py-5 h-7 px-2"
            }`}
          >
            {title ? title : t("TASK")}
          </div>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="break-workds" side="top" sideOffset={6}>
        {title ? title : t("TASK")} - {workspaceName}
      </HoverCardContent>
    </HoverCard>
  );
};
