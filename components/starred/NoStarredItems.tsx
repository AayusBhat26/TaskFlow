"use client";

import { useTranslations } from "next-intl";
import { StarredItemsList } from "../svg/StarredItemsList";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";

export const NoStarredItems = () => {
  const t = useTranslations("STARRED.NO_ITEMS");
  return (
    <Card className="bg-background border-none shadow-none flex flex-col items-center mt-12 sm:mt-16 md:mt-32 text-center overflow-hidden">
      <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col space-y-1.5">
          <h1 className="text-2xl font-semibold leading-none tracking-tight">
            {t("TITLE")}
          </h1>
          <CardDescription className="text-base">{t("DESC")}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="mt-4 sm:mt-0">
        <StarredItemsList />
      </CardContent>
    </Card>
  );
};
