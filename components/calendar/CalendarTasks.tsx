"use client";

import { CalendarItem } from "@/types/extended";
import { useMemo } from "react";
import { CalendarTask } from "./CalendarTask";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { ShowMore } from "./ShowMore";
import { useMediaQuery } from "@react-hook/media-query";

interface Props {
  calendarItems: CalendarItem[];
}

export const CalendarTasks = ({ calendarItems }: Props) => {
  const visibleItems = useMemo(() => {
    return calendarItems.slice(0, 2);
  }, [calendarItems]);
  const isSmallScreen = useMediaQuery("(max-width: 640px)");

  if (isSmallScreen) {
    return (
      <div className="relative flex flex-col items-center justify-center py-1 h-full overflow-y-clip">
        {calendarItems.length >= 1 && (
          <ShowMore
            small
            leftItemsAmount={calendarItems.length}
            calendarItems={calendarItems}
          />
        )}
      </div>
    );
  } else {
    return (
      <ScrollArea className="w-full h-full">
        <div className="relative flex flex-col gap-1.5 py-1 h-full overflow-y-clip">
          {visibleItems.map((calendarItem) => (
            <CalendarTask key={calendarItem.taskId} dayInfo={calendarItem} />
          ))}
          {calendarItems.length > 3 && (
            <ShowMore
              leftItemsAmount={calendarItems.length - visibleItems.length}
              calendarItems={calendarItems}
            />
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  }
};
