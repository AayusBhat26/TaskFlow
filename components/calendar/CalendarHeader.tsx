"use client";

import { useFormatter, useTranslations } from "next-intl";
import dayjs from "dayjs";
import { Button } from "../ui/button";

interface Props {
  monthIndex: number;
  onResetMonthHandler: () => void;
  onChangeMonthHandler: (change: "next" | "prev") => void;
}

export const CalendarHeader = ({
  monthIndex,
  onChangeMonthHandler,
  onResetMonthHandler,
}: Props) => {
  const format = useFormatter();

  const dateTime = new Date(dayjs().year(), monthIndex);

  const year = format.dateTime(dateTime, {
    year: "numeric",
  });

  const month = format.dateTime(dateTime, {
    month: "long",
  });
  const t = useTranslations("CALENDAR.HEADER");
  return (
    <div className="w-full flex flex-col sm:flex-row justify-between items-center">
      <h1 className="text-xl sm:text-2xl md:text-3xl mb-4 md:mb-0">
        <span className="font-bold">{month}</span> <span>{year}</span>
      </h1>
      <div>
        <Button
          onClick={() => {
            onChangeMonthHandler("prev");
          }}
          className="rounded-e-none px-2 py-1 h-8 sm:h-10 sm:px-4 sm:py-2"
          variant={"outline"}
        >
          {t("PREV")}
        </Button>
        <Button
          onClick={onResetMonthHandler}
          className="rounded-e-none px-2 py-1 h-8 sm:h-10 sm:px-4 sm:py-2"
          variant={"outline"}
        >
          {t("TODAY")}
        </Button>
        <Button
          onClick={() => {
            onChangeMonthHandler("next");
          }}
          className="rounded-e-none px-2 py-1 h-8 sm:h-10 sm:px-4 sm:py-2"
          variant={"outline"}
        >
          {t("NEXT")}
        </Button>
      </div>
    </div>
  );
};
