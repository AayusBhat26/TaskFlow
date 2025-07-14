"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Info } from "lucide-react";
import React, { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { te, enUS } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { useLocale, useTranslations } from "next-intl";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../../ui/hover-card";
import { useDebouncedCallback } from "use-debounce";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAutosaveIndicator } from "@/context/AutosaveIndicator";

interface Props {
  onUpdateForm: (e: DateRange | undefined) => void;
  from: Date | undefined;
  to: Date | undefined;
  workspaceId: string;
  taskId: string;
}

export function TaskCalendar({
  className,
  onUpdateForm,
  from,
  to,
  workspaceId,
  taskId,
}: React.HTMLAttributes<HTMLDivElement> & Props) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });
  const t = useTranslations("TASK.HEADER.DATE");
  const lang = useLocale();
  const { status, onSetStatus } = useAutosaveIndicator();

  const currentLocale = useMemo(() => {
    if (lang === "te") return te;
    else return enUS;
  }, [lang]);

  const { mutate: updateTaskDate, isPending } = useMutation({
    mutationFn: async () => {
      await axios.post("/api/task/update/date", {
        workspaceId,
        date,
        taskId,
      });
    },
    onSuccess: () => {
      onSetStatus("saved");
    },
    onError: () => {
      onSetStatus("unsaved");
    },
  });

  const debounced = useDebouncedCallback(() => {
    onSetStatus("pending");
    updateTaskDate();
  }, 2000);

  const onSelectDateChange = (date: DateRange | undefined) => {
    if (status !== "unsaved") onSetStatus("unsaved");
    setDate(date);
    onUpdateForm(date);
    debounced();
  };
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <HoverCard openDelay={250} closeDelay={250}>
        <HoverCardTrigger>
          <Info size={16} className="w-4 h-4" />
        </HoverCardTrigger>
        <HoverCardContent align="start">{t("INFO")}</HoverCardContent>
      </HoverCard>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            size={"sm"}
            variant={"outline"}
            className={cn(
              "w-fit h-fit text-xs justify-start text-left font-normal px-2.5 py-0.5"
            )}
          >
            <CalendarIcon size={16} className="mr-2 w-3 h-3" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd LLL y", {
                    locale: currentLocale,
                  })}{" "}
                  -{" "}
                  {format(date.to, "dd LLL y", {
                    locale: currentLocale,
                  })}
                </>
              ) : (
                format(date.from, "dd LLL y", {
                  locale: currentLocale,
                })
              )
            ) : (
              <span>{t("PICK")}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onSelectDateChange}
            locale={currentLocale}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
