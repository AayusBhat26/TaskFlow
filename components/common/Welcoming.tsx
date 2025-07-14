"use client";
import React from "react";
import { usePathname } from "next-intl/client";
import { cn } from "@/lib/utils";
import { useFormatter, useTranslations } from "next-intl";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  showOnlyOnPath?: string;
  username: string;
  name?: string | null;
  surname?: string | null;
}

const Welcoming = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      className,
      hideOnMobile,
      hideOnDesktop,
      showOnlyOnPath,
      username,
      surname,
      name,
      ...props
    },
    ref
  ) => {
    const pathname = usePathname();

    const format = useFormatter();

    const dateTime = new Date();
    const t = useTranslations("COMMON");

    const day = format.dateTime(dateTime, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const time = format.dateTime(dateTime, {
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h24",
    });

    if (showOnlyOnPath && pathname !== showOnlyOnPath) return null;
    else {
      return (
        <div
          ref={ref}
          className={cn(
            `space-y-1 ${hideOnDesktop ? "lg:hidden" : ""} ${
              hideOnMobile ? "hidden lg:block" : ""
            }`,
            className
          )}
          {...props}
        >
          <p className="font-bold sm:text-3xl text-2xl">
            {t("WELCOMEBACK")},{" "}
            <span>
              {name
                ? name && surname
                  ? `${name} ${surname}`
                  : name
                : username}
            </span>{" "}
            👋
          </p>
          <p className="text-muted-foreground max-w-sm sm:max-w-xl">
            {day[0].toUpperCase() + day.slice(1)}
          </p>
        </div>
      );
    }
  }
);

Welcoming.displayName = "Welcoming";

export default Welcoming;
