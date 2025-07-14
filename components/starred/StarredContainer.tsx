"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import { useQuery } from "@tanstack/react-query";

import { StarredItem as StarredItemType } from "@/types/saved";
import { LoadingScreen } from "../common/LoadingScreen";
import { StarredItem } from "./StarredItem";
import { SortSelect } from "./SortSelect";
import { NoStarredItems } from "./NoStarredItems";
import { useTranslations } from "next-intl";
import { ClientError } from "../error/ClientError";

interface Props {
  userId: string;
}

export const StarredContainer = ({ userId }: Props) => {
  const params = useSearchParams();
  const sortParam = params.get("sort");
  const sortType = sortParam && sortParam === "desc" ? "desc" : "asc";

  const t = useTranslations("STARRED");

  const {
    data: starredItems,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryFn: async () => {
      const res = await fetch(
        `/api/saved/get?userId=${userId}&sort=${sortType}`
      );

      if (!res.ok) throw new Error();

      const data = (await res.json()) as StarredItemType[];
      return data;
    },
    queryKey: ["getStarredItems", userId, sortType],
  });

  if (isLoading) return <LoadingScreen />;

  if (isError) return <ClientError message={t("ERROR")} />;

  if (starredItems?.length === 0) return <NoStarredItems />;
  return (
    <Card className="bg-background border-none shadow-none">
      <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col space-y-1.5 mb-4 sm:mb-0">
          <h1 className="text-2xl font-semibold leading-none tracking-tight">
            {t("TITLE")}
          </h1>
          <CardDescription className="text-base">{t("DESC")}</CardDescription>
        </div>
        <SortSelect sortType={sortType} refetch={refetch} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {starredItems?.map((starredItem) => (
          <StarredItem
            key={starredItem.id}
            item={starredItem}
            sortType={sortType}
            userId={userId}
          />
        ))}
      </CardContent>
    </Card>
  );
};
