"use client";

import dayjs from "dayjs";
import { Fragment } from "react";
import { Day } from "./Day";
import { CalendarItem } from "@/types/extended";
import { useTranslations } from "next-intl";

interface Props {
  currMonth: dayjs.Dayjs[][];
  monthIndex: number;
  calendarItems: CalendarItem[];
}

const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export const CalendarGrid = ({
  currMonth,
  monthIndex,
  calendarItems,
}: Props) => {
  const t = useTranslations("CALENDAR.DAYS_OF_WEEK");

  return (
    <>
      <div className="w-full h-full flex flex-col gap-3">
        <div className="w-full grid grid-cols-7 text-right">
          {daysOfWeek.map((day, index) => (
            <p className="mr-2 font-semibold text-sm">{t(day)}</p>
          ))}
        </div>
        <div className="w-full h-full grid grid-cols-7 grid-rows-5">
          {currMonth.map((row, i) => (
            <Fragment key={i}>
              {row.map((day, idx) => (
                <Day
                  monthIndex={monthIndex}
                  day={day}
                  calendarItems={calendarItems}
                />
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
};
