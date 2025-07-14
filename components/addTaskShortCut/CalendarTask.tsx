"use client";

import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { enUS, te } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";

interface Props {
  date: DateRange | undefined;
  onSelectedDate: (date: DateRange | undefined) => void;
}

export const CalendarTask = ({ date, onSelectedDate }: Props) => {
  const lang = useLocale();
  const t = useTranslations("TASK_SHORTCUT");

  const currentLocale = useMemo(() => {
    if (lang === "te") return te;
    else return enUS;
  }, [lang]);

  return (
    <div className="flex items-center gap-1">
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
              <span>{t("DUE_DATE")}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onSelectedDate}
            locale={currentLocale}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
